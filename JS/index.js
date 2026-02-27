function initStatementManager() {

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let editIndex = null;

  const dateInput = document.getElementById("date");
  const headerInput = document.getElementById("header");
  const creditInput = document.getElementById("credit");
  const debitInput = document.getElementById("debit");
  const addBtn = document.getElementById("addBtn");
  const tbody = document.getElementById("tbody");

  function saveToLocal() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  function clearInputs() {
    dateInput.value = "";
    headerInput.value = "";
    creditInput.value = "";
    debitInput.value = "";
  }

  function render() {
    tbody.innerHTML = "";

    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach((t, index) => {

      totalCredit += t.credit;
      totalDebit += t.debit;

      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${t.date}</td>
          <td>${t.header}</td>
          <td>${t.credit || ""}</td>
          <td>${t.debit || ""}</td>
          <td>
            <button class="btn btn-sm btn-warning edit-btn" data-index="${index}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Remove</button>
          </td>
        </tr>
      `;

      tbody.innerHTML += row;
    });

    document.getElementById("totalCredit").innerText = totalCredit;
    document.getElementById("totalDebit").innerText = totalDebit;
    document.getElementById("balance").innerText = totalCredit - totalDebit;
  }

  function addOrUpdate() {

    const date = dateInput.value;
    const header = headerInput.value;
    const credit = parseFloat(creditInput.value) || 0;
    const debit = parseFloat(debitInput.value) || 0;

    if (!date || !header) return alert("Buddy, Fill the required fields");
    if (credit && debit) return alert("Enter either credit OR debit but not both");

    const data = { date, header, credit, debit };

    if (editIndex === null) {
      transactions.push(data);
    } else {
      transactions[editIndex] = data;
      editIndex = null;
    }

    saveToLocal();
    clearInputs();
    render();
  }

  function handleTableClick(e) {

    const index = e.target.dataset.index;

    if (e.target.classList.contains("edit-btn")) {

      const t = transactions[index];
      dateInput.value = t.date;
      headerInput.value = t.header;
      creditInput.value = t.credit || "";
      debitInput.value = t.debit || "";

      editIndex = index;

    }

    if (e.target.classList.contains("delete-btn")) {

      transactions.splice(index, 1);
      saveToLocal();
      render();
    }
  }

  // Event Listeners
  addBtn.addEventListener("click", addOrUpdate);
  tbody.addEventListener("click", handleTableClick);

  // Initial render
  render();
}

/* Call function on page load */
document.addEventListener("DOMContentLoaded", initStatementManager);