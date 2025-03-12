document.body.style.border = "20px solid #00005e";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    document.body.style.border = "20px solid #ffde59";

    let data = [];

    const tableDiv = document.getElementsByClassName("ncc-table")[2];
    const table = tableDiv.getElementsByTagName("table")[0];
    const rows = table.getElementsByTagName("tr");
    for (let k = 0; k < rows.length; k++) {
        const row = rows[k];
        if (!row.classList.contains("sticky-header") && !row.classList.contains("subheader")) {
            const link = row.getElementsByTagName("a")[0];
            link.click();
            await sleep(500);
            const popups = document.getElementsByTagName("nwcc-modal");
            for (let m = 0; m < popups.length; m++) {
                const popup = popups[m];
                const closeButton = document.getElementsByClassName("ncc-modal__close")[0].getElementsByTagName("button")[0];
                const externalId = popup.getElementsByClassName("ncc-modal__body")[0].getAttribute("aria-labelledby").replace("ncc-modal__title_", "");
                let transactionTable = document.getElementById("transaction-details-section");
                if(transactionTable == null){
                    await sleep(1000);
                    transactionTable = document.getElementById("transaction-details-section");
                }
                const transactionRows = transactionTable.getElementsByTagName("tr");
                let transactionData = {"external_id": externalId};
                for (let n = 0; n < transactionRows.length; n++) {
                    const transactionRow = transactionRows[n];
                    const transactionKey = transactionRow.children[0].textContent.toLowerCase().replace(/[^0-9a-zA-ZäöåÄÖÅ]/g, "");
                    const transactionValue = transactionRow.children[1].textContent.replace("\n", " ");
                    const transactionValueLower = transactionValue.toLowerCase();
                    switch (transactionKey) {
                        case "rubrik":
                            if(transactionValueLower.includes("swish")){
                                transactionData["method"] = "se_swish";
                            }
                            else {
                                transactionData["method"] = "transfer";
                            }
                            break;
                        case "belopp":
                            let amount = transactionValue.split(" ");
                            amount.pop();
                            transactionData["amount"] = amount.join(" ");
                            break;
                        case "bokföringsdag":
                            transactionData["date_accounting"] = transactionValue;
                            break;
                        case "räntedag":
                            transactionData["date_interest"] = transactionValue;
                            break;
                        case "namn":
                            transactionData["sender"] = transactionValue;
                            break;
                        case "frånnamnbank":
                            transactionData["sender"] = transactionValue;
                            break;
                        case "mottagare":
                            transactionData["sender"] = transactionValue;
                            break;
                        case "meddelandeocr":
                            transactionData["text"] = transactionValue;
                            break;
                        case "egnaanteckningar":
                            if(!"text" in transactionData) {
                                transactionData["text"] = transactionValue;
                            }
                            break;
                        case "referensnummerswish":
                            transactionData["reference"] = transactionValue;
                            break;
                        case "ytterligaredetaljer":
                            if(!"text" in transactionData) {
                                transactionData["text"] = transactionValue;
                            }
                            break;
                        case "mottagarenstelefonnummer":
                            transactionData["se_swish:phone_receiver"] = transactionValue;
                            break;
                        case "avsändarenstelefonnummer":
                            transactionData["se_swish:phone_sender"] = transactionValue;
                            break;
                    }
                }
                let transactionLine = "";
                const labels = ["method", "amount", "text", "sender", "reference", "external_id", "date_accounting", "date_interest", "se_swish:phone_receiver", "se_swish:phone_sender"];
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
                closeButton.click();
                await sleep(500);
            }
        }
    }

    document.body.style.border = "20px solid #2e7d32";

    let csvContent = "method;amount;text;sender;reference;external_id;date_accounting;date_interest;se_swish:phone_sender;se_swish:phone_receiver\r\n";
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
