/**
 * Automated Verification & RBAC Security Test Suite
 * Tests Customer Login, Officer Login, Role-Based Access Control,
 * Backend Security Guards, Session Persistence, and Route Guards.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock browser globals for Node environment
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null;
  }
  setItem(k, v) {
    this.store[k] = String(v);
  }
  removeItem(k) {
    delete this.store[k];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();
global.window = global;
global.document = {
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => null
  },
  getElementById: (id) => {
    return {
      id,
      value: '',
      innerText: '',
      innerHTML: '',
      className: '',
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      style: {},
      focus: () => {},
      reset: () => {},
      getContext: () => ({
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        fillText: () => {}
      }),
      getBoundingClientRect: () => ({ width: 600, height: 320 })
    };
  },
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.scrollTo = () => {};

// Load engine and app
const engine = require('./oop-engine.js');
const CoreBankingManager = engine.CoreBankingManager;
const BankAccount = engine.BankAccount;
const SavingsAccount = engine.SavingsAccount;
const CurrentAccount = engine.CurrentAccount;
const Customer = engine.Customer;
const BankOfficer = engine.BankOfficer;

console.log('====================================================');
console.log('MAHABANK SECURITY & RBAC VERIFICATION TEST SUITE');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

(async () => {
  const manager = new CoreBankingManager();

  // Test 1: Class Hierarchy & OOP design
  runTest('1. OOP Hierarchy: Customer & BankOfficer inherit from User', () => {
    assert(manager.officers.length > 0, 'Seed officers should exist');
    const officer = manager.officers[0];
    assert(officer instanceof BankOfficer, 'Officer should be instance of BankOfficer');
    assert(officer instanceof engine.User, 'Officer should inherit from User');
    assert.strictEqual(officer.role, 'OFFICER');
    assert.strictEqual(officer.isOfficer(), true);
    assert.strictEqual(officer.isCustomer(), false);

    const cust = new Customer({
      username: 'testcust',
      fullName: 'Test Customer',
      accountNumber: '1001999999'
    });
    assert(cust instanceof Customer, 'Customer should be instance of Customer');
    assert(cust instanceof engine.User, 'Customer should inherit from User');
    assert.strictEqual(cust.role, 'CUSTOMER');
    assert.strictEqual(cust.isCustomer(), true);
    assert.strictEqual(cust.isOfficer(), false);
  });

  // Test 2: Unauthenticated state blocks protected operations
  runTest('2. Security: Unauthenticated access is blocked', () => {
    manager.logout();
    assert.strictEqual(manager.isOfficerLoggedIn(), false);
    assert.strictEqual(manager.isCustomerLoggedIn(), false);

    assert.throws(() => {
      manager.deposit('1001248921', 100);
    }, /Access Denied/i);

    assert.throws(() => {
      manager.withdraw('1001248921', 100);
    }, /Access Denied/i);

    assert.throws(() => {
      manager.searchAccounts('amit');
    }, /Access Denied/i);

    assert.throws(() => {
      manager.getAllAccounts();
    }, /Access Denied/i);
  });

  // Test 3: Customer Registration & Password Hashing
  await runAsyncTest('3. Registration: Creates customer with SHA-256 password hash', async () => {
    const regAcc = await manager.createAccount({
      holderName: 'Rohan Sunil Gavaskar',
      username: 'rohangavaskar',
      email: 'rohan@example.com',
      phoneNumber: '9822998877',
      accountType: 'Savings',
      openingDeposit: 1500,
      password: 'SecurePassword@123'
    });

    assert(regAcc.accountNumber.startsWith('1001'), 'Account number should start with 1001');
    assert.strictEqual(regAcc.holderName, 'Rohan Sunil Gavaskar');
    assert.strictEqual(regAcc.getBalance(), 1500);
    assert.notStrictEqual(regAcc.passwordHash, 'SecurePassword@123', 'Password MUST NOT be stored in plain text');
    assert(regAcc.passwordHash.length === 64, 'SHA-256 hash must be 64 hexadecimal characters');
    assert(regAcc.passwordSalt.length > 0, 'Password salt must exist');
  });

  // Test 4: Customer Login Authentication
  await runAsyncTest('4. Customer Login: Authenticates customer and creates customer session', async () => {
    const authRes = await manager.authenticateCustomer('rohangavaskar', 'SecurePassword@123');
    assert(authRes.user instanceof Customer, 'Authenticated user must be instance of Customer');
    assert.strictEqual(manager.isCustomerLoggedIn(), true);
    assert.strictEqual(manager.isOfficerLoggedIn(), false);
    assert.strictEqual(manager.getActiveAccount().accountNumber, authRes.account.accountNumber);
  });

  // Test 5: Customer Security Enforcement (RBAC)
  runTest('5. Customer RBAC: Customer is BLOCKED from officer operations on backend', () => {
    assert.strictEqual(manager.isCustomerLoggedIn(), true);

    // Customer trying officer deposit
    assert.throws(() => {
      manager.deposit('1001248921', 500);
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to perform teller deposit');

    // Customer trying officer withdraw
    assert.throws(() => {
      manager.withdraw('1001248921', 500);
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to perform teller withdraw');

    // Customer trying search accounts
    assert.throws(() => {
      manager.searchAccounts('amit');
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to search customer database');

    // Customer trying toggle status
    assert.throws(() => {
      manager.toggleAccountStatus('1001248921');
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to toggle account status');

    // Customer trying get all accounts
    assert.throws(() => {
      manager.getAllAccounts();
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to inspect all accounts');

    // Customer trying get all bank transactions
    assert.throws(() => {
      manager.getAllTransactions();
    }, /Bank Officer privileges required/i, 'Customer should not be allowed to view all bank transactions');
  });

  // Test 6: Customer Allowed Operations
  runTest('6. Customer Features: Customer can transfer funds and view own transactions', () => {
    const acc = manager.getActiveAccount();
    const prevBal = acc.getBalance();

    // Customer UPI Transfer
    const txn = manager.customerTransfer({
      recipient: '1001248921',
      amount: 500,
      pin: '1234',
      mode: 'UPI',
      remarks: 'UPI Transfer Test'
    });

    assert.strictEqual(acc.getBalance(), prevBal - 500);
    assert.strictEqual(txn.amount, 500);

    // Customer gets only own transactions
    const custTxns = manager.customerGetTransactions();
    assert(custTxns.length > 0);
    assert.strictEqual(custTxns[0].accountNumber, acc.accountNumber);

    // Customer Profile
    const profile = manager.getCustomerProfile();
    assert.strictEqual(profile.accountNumber, acc.accountNumber);
    assert.strictEqual(profile.holderName, acc.holderName);
    assert.strictEqual(profile.ifscCode, 'MAHB0001245');
    assert.strictEqual(profile.rupayCardType, 'RuPay Platinum Global Debit Card');
  });

  // Test 7: Customer cannot log in via Officer Portal
  await runAsyncTest('7. Role Isolation: Customer credentials rejected on Officer login', async () => {
    let failed = false;
    try {
      await manager.authenticateOfficer('rohangavaskar', 'SecurePassword@123');
    } catch (e) {
      failed = true;
      assert(/Invalid Bank Officer credentials/i.test(e.message));
    }
    assert(failed, 'Customer credentials must fail officer authentication');
  });

  // Test 8: Bank Officer Authentication
  await runAsyncTest('8. Officer Login: Authenticates bank officer with SHA-256 hash', async () => {
    const offRes = await manager.authenticateOfficer('officer', 'Password@123');
    assert(offRes.user instanceof BankOfficer, 'Authenticated user must be instance of BankOfficer');
    assert.strictEqual(manager.isOfficerLoggedIn(), true);
    assert.strictEqual(manager.isCustomerLoggedIn(), false);
    assert.strictEqual(offRes.user.officerId, 'OFF-1245');
    assert.strictEqual(offRes.user.fullName, 'Rajesh V. Deshpande');
  });

  // Test 9: Bank Officer Operations (RBAC Allowed)
  runTest('9. Officer Operations: Officer can perform deposit, withdraw, search, all accounts', () => {
    assert.strictEqual(manager.isOfficerLoggedIn(), true);

    // Officer Deposit
    const depRes = manager.deposit('1001248921', 1000);
    assert(depRes.transaction.amount === 1000);

    // Officer Withdraw
    const wdRes = manager.withdraw('1001248921', 500);
    assert(wdRes.transaction.amount === 500);

    // Officer Search Accounts
    const searchRes = manager.searchAccounts('amit');
    assert(searchRes.length > 0);
    assert(searchRes[0].holderName.toLowerCase().includes('amit'));

    // Officer All Accounts
    const allAccs = manager.getAllAccounts();
    assert(allAccs.length >= 3);

    // Officer All Transactions
    const allTxns = manager.getAllTransactions();
    assert(allTxns.length >= 3);

    // Officer Branch Stats
    const stats = manager.getBranchStats();
    assert(stats.totalDeposits > 0);
    assert(stats.totalAccounts >= 3);
  });

  // Test 10: Logout & Session Reset
  runTest('10. Logout: Clears active session and resets permissions', () => {
    manager.logout();
    assert.strictEqual(manager.isOfficerLoggedIn(), false);
    assert.strictEqual(manager.isCustomerLoggedIn(), false);
    assert.strictEqual(manager.getActiveUser(), null);

    assert.throws(() => {
      manager.deposit('1001248921', 100);
    }, /Access Denied/i);
  });

  console.log('====================================================');
  console.log(`TEST SUMMARY: ${passedTests} of ${totalTests} tests passed.`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
})();
