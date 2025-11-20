document.body.style.border = "20px solid #00005e";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    document.body.style.border = "20px solid #ffde59";

    let data = [];

    var h3Titles = document.getElementsByTagName("h3");
    var tableDiv;

    for (var i = 0; i < h3Titles.length; i++) {
      if (h3Titles[i].textContent === "Tidigare") {
        tableDiv = h3Titles[i].parentElement;
        break;
      }
    }

    var rows = tableDiv.getElementsByTagName("ul");
    for (let k = 0; k < rows.length; k++) {
        const row = rows[k];
        const rowDiv = row.children[0].children[0];
        const rowButton = rowDiv.children[0];
        rowButton.click();
        await sleep(500);
        const transactionRows = rowDiv.children[1].children[0].children[0].getElementsByTagName("div");
        let transactionData = {"method": "transfer"};
        for (let n = 0; n < transactionRows.length; n++) {
            const transactionRow = transactionRows[n];
            const transactionKey = transactionRow.children[0].children[0].textContent.toLowerCase().replace(/[^0-9a-zA-ZäöåÄÖÅ]/g, "");
            const transactionValue = transactionRow.children[1].textContent.replace("\n", " ");
            console.log(transactionKey);
            switch (transactionKey) {
                case "belopp":
                    let amount = transactionValue.split(" ");
                    amount.pop();
                    transactionData["amount"] = amount.join(" ");
                    break;
                case "datumföröverföring":
                    transactionData["date_accounting"] = transactionValue;
                    transactionData["date_interest"] = transactionValue;
                    break;
                case "datumförinsättning":
                    if(!("date_accounting" in transactionData)) {
                        transactionData["date_accounting"] = transactionValue;
                        transactionData["date_interest"] = transactionValue;
                    }
                    break;
                case "tillkonto":
                    transactionData["sender"] = transactionValue;
                    break;
                case "meddelandetillmottagare":
                    transactionData["text"] = transactionValue;
                    break;
                case "egennotering":
                    if(!("text" in transactionData)) {
                        transactionData["notes"] = transactionValue;
                    }
                    break;
            }
        }
        let transactionLine = "";
        const labels = ["method", "amount", "text", "sender", "date_accounting", "date_interest"];
        for(let a = 0; a < labels.length; a++){
            const label = labels[a];
            if(label in transactionData){
                transactionLine += transactionData[label];
            }
            if(a < labels.length - 1){
                transactionLine += ";";
            }
        }
        data.push(transactionLine);
        await sleep(500);
    }

    document.body.style.border = "20px solid #2e7d32";

    let csvContent = "method;amount;text;sender;date_accounting;date_interest\r\n";
    for(let i = 0; i < data.length; i++){
        csvContent += data[i] + "\r\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8," });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objUrl);
    link.setAttribute("download", 'nordea.csv');
    document.querySelector('body').append(link);
    link.click();
}

main();
