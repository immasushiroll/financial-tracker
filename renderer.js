console.log("renderer loaded");
// let thePath = "/home/immasushiroll/Windows/Users/jane8/repos/financial-tracker/data.json";

// var fs = require('fs');
// fs.readFile(thePath, 'utf8', function (err, data) {
//   if (err) return console.log(err);
//     console.log(data);
// });

window.addEventListener("DOMContentLoaded", () => {
    const name_input = document.getElementById("name_test");
    const portfolio_input = document.getElementById("portfolio_test");
    const buy_sell_input = document.getElementById("buy/sell_test");
    const amount_input = document.getElementById("amount");
    const price_input = document.getElementById("price");
    const finalbuyprice_input = document.getElementById("finalbuyprice");
    const stockcode_input = document.getElementById("stockcode");
    const button = document.getElementById("write");
    // console.log(button);

    button.addEventListener("click", () => {

        const data = {
            Name: name_input.options[name_input.selectedIndex].text,
            Portfolio: portfolio_input.options[portfolio_input.selectedIndex].text,
            BuySell: buy_sell_input.options[buy_sell_input.selectedIndex].value,
            Amount: Number(amount_input.value),
            Price: Number(price_input.value),
            FinalBuyPrice: Number(finalbuyprice_input.value),
            StockCode: stockcode_input.value.trim()
        };

        window.electronAPI.saveToJSON(data);
    });

    const routebutton = document.getElementById("router");
    routebutton.addEventListener("click", () => {
        console.log("button clicked");
        window.electronAPI.router('transactions.html')
    });
});

async function loadTable() {
    const data = await window.electronAPI.getTransactionsJSON();
    const tbody = document.getElementById("table-records");

    tbody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.Name}</td>
            <td>${row.Portfolio}</td>
            <td>${row.BuySell}</td>
            <td>${row.Amount}</td>
            <td>${row.Price}</td>
            <td>${row.FinalBuyPrice}</td>
            <td>${row.StockCode}</td>
            <td>${row.Timestamp}</td>
        `;

        tbody.appendChild(tr);
    });
}

loadTable();

document.getElementById('ocr-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('image_upload').files[0];
  const buffer = await file.arrayBuffer();

  const result = await window.api.extractText(buffer); // <-- not fetch()!
  document.getElementById('extracted-text').textContent = result.text;
});