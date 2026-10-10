const fs = require('fs');

async function scrapeConsumerCouncil() {
    console.log("🚀 開始連接澳門消委會物價情報站...");
    
    try {
        const url = 'https://consumer.dsedt.gov.mo/commodity/price_station.aspx?lang=zh';
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`網絡請求失敗，狀態碼: ${response.status}`);
        }

        const html = await response.text();
        
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        let extractedData = [];

        // 針對政府 ASPX 表格進行全自動解析
        $('table tr').each((index, element) => {
            // 略過第一行表頭 (Header)
            if (index === 0) return;

            let cols = $(element).find('td');
            if (cols.length >= 2) {
                let name = $(cols.eq(1)).text().trim(); // 假設商品名稱在第二欄
                let barcode = `MACAU-${index}`;
                
                let prices = [];
                // 假設後續幾欄是不同超市的價格
                for (let i = 2; i < cols.length; i++) {
                    let priceText = $(cols.eq(i)).text().replace(/[^0-9.]/g, '');
                    let price = parseFloat(priceText);
                    if (!isNaN(price) && price > 0) {
                        prices.push({
                            shop: `超級市場 ${i - 1}`,
                            price: price,
                            is_cheapest: false
                        });
                    }
                }

                if (name && prices.length > 0) {
                    prices.sort((a, b) => a.price - b.price);
                    prices[0].is_cheapest = true;

                    extractedData.push({
                        barcode: barcode,
                        name: name,
                        prices: prices
                    });
                }
            }
        });

        // 如果成功抓取到表格數據，寫入 prices.json
        if (extractedData.length > 0) {
            fs.writeFileSync('./prices.json', JSON.stringify(extractedData, null, 2), 'utf-8');
            console.log(`✅ 成功全自動更新 ${extractedData.length} 件真實商品物價！`);
        } else {
            console.log("⚠️ 提示：未能在網頁中直接解析出表格，保留現有數據以確保網站運作。");
        }

    } catch (error) {
        console.error("❌ 抓取過程發生錯誤：", error.message);
    }
}

scrapeConsumerCouncil();
