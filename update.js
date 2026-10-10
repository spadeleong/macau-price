const fs = require('fs');

console.log("開始執行澳門超市物價更新程序...");

// 模擬從政府或消委會接口獲取到的最新數據
// 實際運作時，這裡會寫 fetch('你的目標API') 獲取真實 JSON
let freshData = [
  {
    "barcode": "4891028000018",
    "name": "維他奶原味 250ml (自動更新版)",
    "prices": [
      { "shop": "新苗超級市場 (氹仔店)", "price": 5.0, "is_cheapest": true },
      { "shop": "來來超級市場 (花城店)", "price": 5.5, "is_cheapest": false },
      { "shop": "百佳超級市場 (氹仔店)", "price": 5.5, "is_cheapest": false }
    ]
  },
  {
    "barcode": "4891008100110",
    "name": "金象牌頂上香米 5kg (自動更新版)",
    "prices": [
      { "shop": "新苗超級市場 (氹仔店)", "price": 76.5, "is_cheapest": true },
      { "shop": "百佳超級市場 (氹仔店)", "price": 85.0, "is_cheapest": false },
      { "shop": "來來超級市場 (花城店)", "price": 86.5, "is_cheapest": false }
    ]
  }
];

// 將最新數據寫入 prices.json 檔案
fs.writeFileSync('./prices.json', JSON.stringify(freshData, null, 2), 'utf-8');
console.log("prices.json 已成功自動更新！");
