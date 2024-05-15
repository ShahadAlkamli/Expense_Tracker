const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// const dummyTransactions = [
//   { id: 1, text: 'Flower', amount: -20 },
//   { id: 2, text: 'Salary', amount: 300 },
//   { id: 3, text: 'Book', amount: -10 },
//   { id: 4, text: 'Camera', amount: 150 }
// ];

const localStorageTransactions = JSON.parse(
  localStorage.getItem('transactions')
);

let transactions = [];

function fetchTransactions() {
  fetch('http://127.0.0.1:8000/api/transactions/', {
    headers: {
      'Authorization': 'Token 23b7b9029da097cf8a89bc1e7b88d9f87f66a9dd'
    }
  })
    .then(response => response.json())
    .then(data => {
      transactions = data;
      init();
    })
    .catch(error => {
      console.error('Error fetching transactions:', error);
    });
}



// Init app
function init() {
  list.innerHTML = '';

  transactions.forEach(addTransactionDOM);
  updateValues();
}

// Fetch transactions when the page loads
document.addEventListener('DOMContentLoaded', fetchTransactions);

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
  } else {
    const transaction = {
      text: text.value,
      amount: parseFloat(amount.value)
    };

    fetch('http://127.0.0.1:8000/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token 23b7b9029da097cf8a89bc1e7b88d9f87f66a9dd' 
      },
      body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(data => {
      console.log('New transaction added:', data);

      // Update the local transactions array
      transactions.push({
        id: data.id,
        text: data.text,
        amount: parseFloat(data.amount)
      });

      console.log('Transactions after adding:', transactions);

      // Fetch updated transactions after adding a new one
            fetchTransactions();

      // Update the balance, income, and expense
      updateValues();

      // Update the local storage
      updateLocalStorage();

      // Clear the form fields
      text.value = '';
      amount.value = '';
    })
    .catch(error => {
      console.error('Error adding transaction:', error);
    });
  }
}



// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount < 0 ? '-' : '+';

  const item = document.createElement('li');

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

   item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(
      transaction.amount
    )}</span> <button class="delete-btn" onclick="removeTransaction(${
      transaction.id
    })">x</button>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
  let total = 0;
  let income = 0;
  let expense = 0;

  if (transactions && Array.isArray(transactions)) {
    total = transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    income = transactions.filter(transaction => parseFloat(transaction.amount) > 0).reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    expense = Math.abs(transactions.filter(transaction => parseFloat(transaction.amount) < 0).reduce((acc, curr) => acc + parseFloat(curr.amount), 0));
  }

  balance.innerText = `$${total.toFixed(2)}`;
  money_plus.innerText = `$${income.toFixed(2)}`;
  money_minus.innerText = `$${expense.toFixed(2)}`;
}




// Remove transaction by ID
function removeTransaction(id) {
  fetch(`http://127.0.0.1:8000/api/transactions/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Token 23b7b9029da097cf8a89bc1e7b88d9f87f66a9dd' 
    },
  })
  .then(response => {
    if (response.ok) {
      // Remove the transaction from the local array
      transactions = transactions.filter(transaction => transaction.id !== id);
  
      // Update the UI and local storage
      updateLocalStorage();
      init();
    } else {
      throw new Error('Failed to delete transaction');
    }
  })
  .catch(error => {
    console.error('Error deleting transaction:', error);
  });
}


// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}


init();

form.addEventListener('submit', addTransaction);
