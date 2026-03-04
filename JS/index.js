document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:3000/txns";

  const dateInput = document.getElementById("date");
  const headerInput = document.getElementById("header");
  const creditInput = document.getElementById("credit");
  const debitInput = document.getElementById("debit");
  const addBtn = document.getElementById("addBtn");
  const tbody = document.getElementById("tbody");

  const creditHeading = document.getElementById("creditHeading");
  const debitHeading = document.getElementById("debitHeading");
  const amountRow = document.getElementById("amountRow");

  // =========================
  // FETCH ALL TRANSACTIONS
  // =========================
  async function fetchTransactions() {

    const res = await fetch(API_URL);
    const data = await res.json();

    renderRows(data);
  }

  // =========================
  // RENDER TABLE
  // =========================
  function renderRows(data) {

  tbody.innerHTML = "";

  let totalCredit = 0;
  let totalDebit = 0;

  data.forEach((txn, index) => {

    const credit = txn.txnType === "CREDIT" ? Number(txn.amount || 0) : 0;
    const debit = txn.txnType === "DEBIT" ? Number(txn.amount || 0) : 0;

    totalCredit += credit;
    totalDebit += debit;

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${txn.txnDate}</td>
        <td>${txn.header}</td>
        <td>${credit ? credit : ""}</td>
        <td>${debit ? debit : ""}</td>
        <td>
  <button type="button" class="btn btn-warning btn-sm edit-btn" data-id="${txn.id}">Edit</button>
  <button type="button" class="btn btn-danger btn-sm delete-btn" data-id="${txn.id}">Remove</button>
</td>
      </tr>
    `;

    tbody.innerHTML += row;
  });

  // update totals
  document.getElementById("totalCredit").innerText = totalCredit;
  document.getElementById("totalDebit").innerText = totalDebit;

  // update balance
  document.getElementById("balance").innerText = totalCredit - totalDebit;
}

  // =========================
  // ADD TRANSACTION
  // =========================
  async function addOrUpdate() {

    const date = dateInput.value;
    const header = headerInput.value;

    const credit = parseFloat(creditInput.value) || 0;
    const debit = parseFloat(debitInput.value) || 0;

    if (!date || !header) {
      alert("Fill required fields");
      return;
    }

    if (credit === 0 && debit === 0) {
      alert("Enter credit OR debit");
      return;
    }

    if (credit > 0 && debit > 0) {
      alert("Enter only one value");
      return;
    }

    const txnType = credit > 0 ? "CREDIT" : "DEBIT";
    const amount = credit > 0 ? credit : debit;

    const payload = {
      header,
      txnDate: date,
      txnType,
      amount
    };

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    dateInput.value = "";
    headerInput.value = "";
    creditInput.value = "";
    debitInput.value = "";

    amountRow.style.display = "none";

    fetchTransactions();
  }

  // =========================
  // TABLE BUTTON EVENTS
  // =========================
  tbody.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    // DELETE
    if (e.target.classList.contains("delete-btn")) {

      await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      fetchTransactions();
    }

    // EDIT
    if (e.target.classList.contains("edit-btn")) {

      const res = await fetch(`${API_URL}/${id}`);
      const txn = await res.json();

      const credit =
        txn.txnType === "CREDIT" ? txn.amount : "";

      const debit =
        txn.txnType === "DEBIT" ? txn.amount : "";

      const row = e.target.closest("tr");

      row.innerHTML = `
      <td>${row.children[0].innerText}</td>

      <td>
        <input type="date" class="form-control edit-date" value="${txn.txnDate}">
      </td>

      <td>
        <input type="text" class="form-control edit-header" value="${txn.header}">
      </td>

      <td>
        <input type="number" class="form-control edit-credit" value="${credit}">
      </td>

      <td>
        <input type="number" class="form-control edit-debit" value="${debit}">
      </td>

      <td>
        <button class="btn btn-success btn-sm save-btn" data-id="${id}">
          Save
        </button>
      </td>
      `;
    }

    // SAVE EDIT
    if (e.target.classList.contains("save-btn")) {

      const row = e.target.closest("tr");

      const date = row.querySelector(".edit-date").value;
      const header = row.querySelector(".edit-header").value;
      const credit = parseFloat(row.querySelector(".edit-credit").value) || 0;
      const debit = parseFloat(row.querySelector(".edit-debit").value) || 0;

      const txnType = credit > 0 ? "CREDIT" : "DEBIT";
      const amount = credit > 0 ? credit : debit;

      const payload = {
        id: Number(id),
        header,
        txnDate: date,
        txnType,
        amount
      };

      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      fetchTransactions();
    }

  });

  // =========================
  // CREDIT HEADING CLICK
  // =========================
  creditHeading.addEventListener("click", () => {

  // if debit already selected, do nothing
  if (debitInput.value !== "") return;

  amountRow.style.display = "table-row";

  creditInput.classList.remove("d-none");
  debitInput.classList.add("d-none");

  creditInput.focus();
});


debitHeading.addEventListener("click", () => {

  // if credit already selected, do nothing
  if (creditInput.value !== "") return;

  amountRow.style.display = "table-row";

  debitInput.classList.remove("d-none");
  creditInput.classList.add("d-none");

  debitInput.focus();
});

  // =========================
  // DEBIT HEADING CLICK
  // =========================
  debitHeading.addEventListener("click", () => {

    amountRow.style.display = "table-row";

    debitInput.classList.remove("d-none");
    creditInput.classList.add("d-none");

    creditInput.value = "";

    debitInput.focus();
  });

  addBtn.addEventListener("click", addOrUpdate);

  fetchTransactions();

});