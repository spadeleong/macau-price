const fs = require('fs');

async function scrapeConsumerCouncil() {
    console.log("🚀 開始全自動連接澳門消委會物價情報站...");
    
    try {
        const url = 'https://consumer.dsedt.gov.mo/commodity/price_station.aspx?lang=zh';
        
        // 發送請求獲取官方網頁 HTML
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`無法連線到消委會網站，狀態碼: ${response.status}`);
        }

        const html = await response.text();
        
        // 載入輕量級解析器
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        let extractedData = [];

        // 自動遍歷消委會頁面中的商品與價格表格
        // （系統會自動提取官網的民生商品數據）
        $('.product-item, tr.data-row, .grid-row').each((index, element) => {
            let name = $(element).find('.product-name, td.name, .title').text().trim();
            let barcode = $(element).attr('data-barcode') || `MACAU-AUTO-${index + 1}`;
            
            let prices = [];
            $(element).find('.shop-price-item, .price-cell, td.price').each((i, shopEl) => {
                let shopName = $(shopEl).find('.shop-name').text().trim() || "超級市場";
                let priceText = $(shopEl).text().replace(/[^0-9.]/g, '');
                let price = parseFloat(priceText) || 0;
                
                if (price > 0) {
                    prices.push({ shop: shopName, price: price, is_cheapest: false });
                }
            });

            // 確保有抓到有效商品及價格
            if (name && prices.length > 0) {
                // 自動排序並標記最平的那間超級市場
                prices.sort((a, b) => a.price - b.price);
                prices[0].is_cheapest = true;

                extractedData.push({
                    barcode: barcode,
                    name: name,
                    prices: prices
                });
            }
        });

        // 如果成功抓取到數據，覆蓋更新 prices.json
        if (extractedData.length > 0) {
            fs.writeFileSync('./prices.json', JSON.stringify(extractedData, null, 2), 'utf-8');
            console.log(`✅ 成功全自動更新 ${extractedData.length} 件商品的最新物價！`);
        } else {
            console.log("⚠️ 提示：官方網頁結構可能正在更新，暫時保留現有數據，確保網站正常運作。");
        }

    } catch (error) {
        console.error("❌ 全自動抓取過程發生錯誤：", error.message);
    }
}

scrapeConsumerCouncil();
