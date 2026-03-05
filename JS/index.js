document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:3000/txns";
    const tbody = document.getElementById("tbody");

    async function fetchTransactions() {
        const res = await fetch(API_URL);
        const data = await res.json();
        renderRows(data);
    }

    function renderRows(data) {
        tbody.innerHTML = "";
        let tCredit = 0;
        let tDebit = 0;

        data.forEach((txn, index) => {
            const amt = parseFloat(txn.amount) || 0;
            const isCredit = txn.txnType === "CREDIT";
            
            if (isCredit) tCredit += amt;
            else tDebit += amt;

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${txn.txnDate}</td>
                    <td>${txn.header}</td>
                    <td class="text-success">${isCredit ? amt : ""}</td>
                    <td class="text-danger">${!isCredit ? amt : ""}</td>
                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" data-id="${txn.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${txn.id}">Remove</button>
                    </td>
                </tr>`;
        });

        document.getElementById("totalCredit").innerText = tCredit;
        document.getElementById("totalDebit").innerText = tDebit;
        document.getElementById("balance").innerText = tCredit - tDebit;
    }

    tbody.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const row = e.target.closest("tr");

        if (e.target.classList.contains("edit-btn")) {
            const res = await fetch(`${API_URL}/${id}`);
            const txn = await res.json();
            row.innerHTML = `
                <td>${row.children[0].innerText}</td>
                <td><input type="date" class="form-control edit-date" value="${txn.txnDate}"></td>
                <td><input type="text" class="form-control edit-header" value="${txn.header}"></td>
                <td><input type="number" class="form-control edit-credit" value="${txn.txnType === 'CREDIT' ? txn.amount : ''}"></td>
                <td><input type="number" class="form-control edit-debit" value="${txn.txnType === 'DEBIT' ? txn.amount : ''}"></td>
                <td><button class="btn btn-success btn-sm save-btn" data-id="${id}">Save</button></td>
            `;
        }

        if (e.target.classList.contains("save-btn")) {
            const cVal = parseFloat(row.querySelector(".edit-credit").value) || 0;
            const dVal = parseFloat(row.querySelector(".edit-debit").value) || 0;

            // NEW MATH LOGIC: Calculate net difference
            // If result is positive, it's a CREDIT. If negative, it's a DEBIT.
            const netAmount = cVal - dVal;
            const finalType = netAmount >= 0 ? "CREDIT" : "DEBIT";
            const finalAmount = Math.abs(netAmount);

            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txnDate: row.querySelector(".edit-date").value,
                    header: row.querySelector(".edit-header").value,
                    txnType: finalType,
                    amount: finalAmount
                })
            });
            fetchTransactions();
        }

        if (e.target.classList.contains("delete-btn")) {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            fetchTransactions();
        }
    });

    // Add Logic with the same math
    document.getElementById("addBtn").onclick = async () => {
        const c = parseFloat(document.getElementById("credit").value) || 0;
        const d = parseFloat(document.getElementById("debit").value) || 0;
        const net = c - d;

        await fetch(API_URL, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                txnDate: document.getElementById("date").value,
                header: document.getElementById("header").value,
                txnType: net >= 0 ? "CREDIT" : "DEBIT",
                amount: Math.abs(net)
            })
        });
        fetchTransactions();
    };

    document.getElementById("creditHeading").onclick = () => {
        document.getElementById("amountRow").style.display = "table-row";
        document.getElementById("credit").classList.remove("d-none");
        document.getElementById("debit").classList.add("d-none");
        document.getElementById("debit").value = "";
    };

    document.getElementById("debitHeading").onclick = () => {
        document.getElementById("amountRow").style.display = "table-row";
        document.getElementById("debit").classList.remove("d-none");
        document.getElementById("credit").classList.add("d-none");
        document.getElementById("credit").value = "";
    };

    fetchTransactions();
});