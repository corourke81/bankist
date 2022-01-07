'use strict';

// BANKIST APP

// Data -- bank accounts, movements are deposits and withdrawals
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// When called, the html for containerMovements is displayed
const displayMovements = function (movements) {
  // Initially empty
  containerMovements.innerHTML = '';

  // Each  movement is given a type and number (index + 1). Movements are styled depending on type. The html is inserted last movement at the top.
  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  // Defining a new key-value pair for an account object
  // Set acc to 0, then add all movements
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  // Display
  labelBalance.textContent = `${account.balance} EUR`;
};

const calcDisplaySummary = function (account) {
  // Filters movements greater or equal to 0 (for symbol >), then sums the absolute values. Similar for <.
  const inOrOut = function (symbol) {
    return account.movements
      .filter(mov => (symbol === '>' ? mov >= 0 : mov < 0))
      .reduce((acc, mov) => acc + Math.abs(mov), 0);
  };
  // Display
  labelSumIn.textContent = `${inOrOut('>')} EUR`;
  labelSumOut.textContent = `${inOrOut('<')} EUR`;

  // For positive movements only (filter), a new array is created by calculating interest (map), amounts less than 1 are filtered out, and the total interest is then summed.
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * 0.01 * account.interestRate)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}`; // 2 decimal places
};

// Creates a username for each account in accounts
const usernameGenerator = function (accs) {
  // For each account, the owner's name is split by the spaces, put into array (split) and a new array created with the initial (map), then joined
  accs.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join(''))
  );
};

usernameGenerator(accounts);

// UI changes with account
const updateUI = function (acc) {
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

let currentAccount;

// btnLogin is arrow to left of PIN
btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // Needed for form submission
  const pin = Number(inputLoginPin.value);
  const username = inputLoginUsername.value;
  // currentAccount - account with this username
  currentAccount = accounts.find(acc => acc.username === username);

  // If currentAccount exists (?), and its pin matches pin entered
  if (currentAccount?.pin === pin) {
    // "Unhide" rest of UI
    containerApp.style.opacity = 100;
    const firstName = currentAccount.owner.split(' ')[0];
    labelWelcome.textContent = `Hello ${firstName}`;
    // Display currentAccount details
    updateUI(currentAccount);
    // Once details submitted, clear fields
    inputLoginPin.value = inputLoginUsername.value = '';
    // Fade a little
    inputLoginPin.blur();
    inputLoginUsername.blur();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferTo = inputTransferTo.value; // username of another account holder
  const transferAmount = Number(inputTransferAmount.value);
  const accountToBeTransferredTo = accounts.find(
    acc => acc.username === transferTo
  );

  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
  inputTransferTo.blur();

  // Valid transfer amount must be positive, less or equal to user's balance, not a transfer to user's own account, and accountToBeTransferredTo must exist.
  // If valid, update account details, and update UI
  if (
    transferAmount > 0 &&
    transferAmount <= currentAccount.balance &&
    accountToBeTransferredTo.username !== currentAccount.username &&
    accountToBeTransferredTo
  ) {
    currentAccount.movements.push(-transferAmount);
    accountToBeTransferredTo.movements.push(transferAmount);
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanRequest = Number(inputLoanAmount.value);
  // boolean. True if any movement is more than 1/10 the loan request
  const approved = currentAccount.movements.some(
    mov => mov >= 0.1 * loanRequest
  );
  if (approved && loanRequest > 0) {
    currentAccount.movements.push(loanRequest);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

//
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  // If currentAccount details match inputs
  if (currentAccount.pin === pin && currentAccount.username === user) {
    // find index of currentAccount in accounts
    const accountNumber = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // and remove it
    accounts.splice(accountNumber, 1);
    // Hide account
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// Movements are not initially sorted
let sorted = false;

btnSort.addEventListener('click', function () {
  const copy = currentAccount.movements.slice(); // A copy of movements
  if (!sorted) {
    // if not sorted
    copy.sort((a, b) => a - b); // sort
    displayMovements(copy); // display sorted movements
  } else {
    displayMovements(currentAccount.movements); // display unsorted movements
  }

  sorted = !sorted;
});
