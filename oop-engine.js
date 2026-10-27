/**
 * ============================================================================
 * MAHABANK - COMPREHENSIVE OBJECT ORIENTED PROGRAMMING (OOPS) ENGINE
 * With Secure Password Hashing & Authentication
 * 
 * 1. CryptoHelper: SHA-256 Password Hashing with Salt (Web Crypto API & Fallback)
 * 2. Class: Transaction (Financial ledger entries with UTR/Vouchers)
 * 3. Class: Complaint (Grievance Redressal System)
 * 4. Base Class: BankAccount (Encapsulation, Status: ACTIVE/DEACTIVATED, Auth credentials)
 * 5. Derived Classes: SavingsAccount & CurrentAccount (Polymorphism)
 * 6. Class: ComputerGraphicsEngine (HTML5 Canvas 2D Bar & Pie Chart Renderer)
 * 7. Class: CoreBankingManager (Central bank repository, Authentication, LocalStorage sync)
 * ============================================================================
 */

/**
 * CryptoHelper
 * Secure password hashing using SHA-256 with random salt.
 * Never stores plain-text passwords.
 */
class CryptoHelper {
  static generateSalt(length = 16) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback pseudo-random salt generator
    let salt = '';
    const chars = '0123456789abcdef';
    for (let i = 0; i < length * 2; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }

  static async hashPassword(password, salt) {
    const combined = salt + ':' + password;
    
    // Prefer Web Crypto API (supported in all modern browsers)
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(combined);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        console.warn('SubtleCrypto error, falling back to pure JS SHA-256', e);
      }
    }
    
    return this.fallbackSha256(combined);
  }

  // Pure JavaScript SHA-256 implementation fallback
  static fallbackSha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;

    let hash = [];
    const k = [];
    let primeCounter = 0;

    const isPrime = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isPrime[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isPrime[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty]; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15],
          w2 = w[i - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

        const s1Round = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        const temp1 = (hash[7] + s1Round + ch + k[i] + w[i]) | 0;
        const s0Round = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        const temp2 = (s0Round + maj) | 0;

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (let b = 3; b >= 0; b--) {
        const byte = (hash[i] >> (8 * b)) & 255;
        result += (byte < 16 ? '0' : '') + byte.toString(16);
      }
    }
    return result;
  }
}

class Transaction {
  constructor({
    id = null,
    accountNumber = '',
    holderName = '',
    type = 'DEPOSIT', // 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'
    category = 'CASH', // 'CASH' | 'UPI' | 'IMPS' | 'NEFT' | 'ATM'
    amount = 0,
    timestamp = new Date().toISOString(),
    balanceAfter = 0,
    reference = ''
  }) {
    this.id = id || 'TXN' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 899 + 100);
    this.accountNumber = String(accountNumber);
    this.holderName = holderName;
    this.type = type;
    this.category = category;
    this.amount = Number(amount);
    this.timestamp = timestamp;
    this.balanceAfter = Number(balanceAfter);
    this.reference = reference || 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
  }

  getFormattedDate() {
    const d = new Date(this.timestamp);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  }

  toJSON() {
    return {
      id: this.id,
      accountNumber: this.accountNumber,
      holderName: this.holderName,
      type: this.type,
      category: this.category,
      amount: this.amount,
      timestamp: this.timestamp,
      balanceAfter: this.balanceAfter,
      reference: this.reference
    };
  }
}

class Complaint {
  constructor({
    id = null,
    accountNumber = '',
    customerName = '',
    category = 'TRANSACTION',
    subject = '',
    description = '',
    timestamp = new Date().toISOString(),
    status = 'PENDING',
    resolution = ''
  }) {
    this.id = id || 'CMP-' + Math.floor(100000 + Math.random() * 900000);
    this.accountNumber = accountNumber;
    this.customerName = customerName;
    this.category = category;
    this.subject = subject;
    this.description = description;
    this.timestamp = timestamp;
    this.status = status;
    this.resolution = resolution;
  }

  getFormattedDate() {
    const d = new Date(this.timestamp);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  resolve(remarks) {
    this.status = 'RESOLVED';
    this.resolution = remarks;
  }

  toJSON() {
    return {
      id: this.id,
      accountNumber: this.accountNumber,
      customerName: this.customerName,
      category: this.category,
      subject: this.subject,
      description: this.description,
      timestamp: this.timestamp,
      status: this.status,
      resolution: this.resolution
    };
  }
}

/**
 * ============================================================================
 * OOP ROLE HIERARCHY: User -> Customer & BankOfficer
 * Demonstrates: OOP Encapsulation, Inheritance, and Role-Based Specialization
 * ============================================================================
 */
class User {
  constructor({
    username = '',
    role = 'CUSTOMER', // 'CUSTOMER' | 'OFFICER'
    passwordHash = '',
    passwordSalt = '',
    fullName = '',
    email = '',
    phoneNumber = '',
    createdDate = new Date().toISOString()
  }) {
    this.username = String(username).toLowerCase().trim();
    this.role = role;
    this.passwordHash = passwordHash;
    this.passwordSalt = passwordSalt;
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = String(phoneNumber);
    this.createdDate = createdDate;
  }

  isOfficer() {
    return this.role === 'OFFICER';
  }

  isCustomer() {
    return this.role === 'CUSTOMER';
  }

  getRoleDisplayName() {
    return this.role === 'OFFICER' ? 'Bank Officer / CBS Manager' : 'Retail Banking Customer';
  }

  toJSON() {
    return {
      username: this.username,
      role: this.role,
      passwordHash: this.passwordHash,
      passwordSalt: this.passwordSalt,
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      createdDate: this.createdDate
    };
  }
}

class Customer extends User {
  constructor({
    username = '',
    passwordHash = '',
    passwordSalt = '',
    fullName = '',
    email = '',
    phoneNumber = '',
    accountNumber = '',
    accountType = 'Savings',
    createdDate = new Date().toISOString()
  }) {
    super({
      username,
      role: 'CUSTOMER',
      passwordHash,
      passwordSalt,
      fullName,
      email,
      phoneNumber,
      createdDate
    });
    this.accountNumber = String(accountNumber);
    this.accountType = accountType;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      accountNumber: this.accountNumber,
      accountType: this.accountType
    };
  }
}

class BankOfficer extends User {
  constructor({
    username = '',
    passwordHash = '',
    passwordSalt = '',
    fullName = '',
    email = '',
    phoneNumber = '',
    officerId = 'OFF-1245',
    designation = 'Branch Manager / CBS Officer',
    branchCode = '1245',
    branchName = 'Baramati Branch (1245)',
    createdDate = new Date().toISOString()
  }) {
    super({
      username,
      role: 'OFFICER',
      passwordHash,
      passwordSalt,
      fullName,
      email,
      phoneNumber,
      createdDate
    });
    this.officerId = officerId;
    this.designation = designation;
    this.branchCode = branchCode;
    this.branchName = branchName;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      officerId: this.officerId,
      designation: this.designation,
      branchCode: this.branchCode,
      branchName: this.branchName
    };
  }
}

class BankAccount {
  constructor({
    accountNumber = '',
    username = '',
    passwordHash = '',
    passwordSalt = '',
    holderName = '',
    email = '',
    phoneNumber = '',
    accountType = 'Savings',
    balance = 0,
    status = 'ACTIVE', // 'ACTIVE' | 'DEACTIVATED'
    ifscCode = 'MAHB0001245',
    branchName = 'Baramati Branch (1245)',
    pin = '1234',
    createdDate = new Date().toISOString(),
    transactions = []
  }) {
    this.accountNumber = String(accountNumber);
    this.username = String(username).toLowerCase().trim();
    this.passwordHash = passwordHash || '';
    this.passwordSalt = passwordSalt || '';
    this.holderName = holderName;
    this.email = email;
    this.phoneNumber = String(phoneNumber);
    this.accountType = accountType;
    this._balance = Number(balance);
    this.status = status;
    this.ifscCode = ifscCode;
    this.branchName = branchName;
    this._pin = pin;
    this.createdDate = createdDate;
    this.transactions = transactions.map(t => (t instanceof Transaction ? t : new Transaction(t)));
  }

  getBalance() {
    return this._balance;
  }

  getFormattedBalance() {
    return '₹ ' + this._balance.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  verifyPin(inputPin) {
    return this._pin === String(inputPin);
  }

  deposit(amount, ref = 'Cash Deposit', category = 'CASH') {
    if (!this.isActive()) {
      throw new Error('Account is DEACTIVATED / FROZEN. Deposit restricted.');
    }
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      throw new Error('Please enter a valid positive deposit amount.');
    }

    this._balance += num;

    const txn = new Transaction({
      accountNumber: this.accountNumber,
      holderName: this.holderName,
      type: 'DEPOSIT',
      category: category,
      amount: num,
      balanceAfter: this._balance,
      reference: ref
    });

    this.transactions.unshift(txn);
    return txn;
  }

  withdraw(amount, pin = null, ref = 'Cash Withdrawal', category = 'CASH') {
    if (!this.isActive()) {
      throw new Error('Account is DEACTIVATED / FROZEN.');
    }
    if (pin && !this.verifyPin(pin)) {
      throw new Error('Invalid PIN. Default PIN is 1234.');
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      throw new Error('Please enter a valid positive withdrawal amount.');
    }

    const minBalance = this.getMinimumBalance();
    if (this._balance - num < minBalance) {
      throw new Error(`Insufficient funds. Minimum balance requirement of ₹ ${minBalance} must be maintained. Current balance: ₹ ${this._balance}`);
    }

    this._balance -= num;

    const txn = new Transaction({
      accountNumber: this.accountNumber,
      holderName: this.holderName,
      type: 'WITHDRAW',
      category: category,
      amount: num,
      balanceAfter: this._balance,
      reference: ref
    });

    this.transactions.unshift(txn);
    return txn;
  }

  transfer({ amount, recipient, pin, mode = 'UPI', remarks = 'Fund Transfer' }) {
    if (!this.isActive()) {
      throw new Error('Account is DEACTIVATED. Transfers not permitted.');
    }
    if (!this.verifyPin(pin)) {
      throw new Error('Invalid security PIN. Default PIN is 1234.');
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      throw new Error('Please enter a valid amount.');
    }

    const minBalance = this.getMinimumBalance();
    if (this._balance - num < minBalance) {
      throw new Error(`Insufficient balance! Minimum balance of ₹ ${minBalance} required. Available: ₹ ${this._balance}`);
    }

    this._balance -= num;

    const txn = new Transaction({
      accountNumber: this.accountNumber,
      holderName: this.holderName,
      type: 'WITHDRAW',
      category: mode,
      amount: num,
      balanceAfter: this._balance,
      reference: `${mode} to ${recipient} (${remarks})`
    });

    this.transactions.unshift(txn);
    return txn;
  }

  getMinimumBalance() {
    return 0;
  }

  toJSON() {
    return {
      accountNumber: this.accountNumber,
      username: this.username,
      passwordHash: this.passwordHash,
      passwordSalt: this.passwordSalt,
      holderName: this.holderName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      accountType: this.accountType,
      balance: this._balance,
      status: this.status,
      ifscCode: this.ifscCode,
      branchName: this.branchName,
      pin: this._pin,
      createdDate: this.createdDate,
      transactions: this.transactions.map(t => t.toJSON())
    };
  }
}

class SavingsAccount extends BankAccount {
  constructor(config = {}) {
    super({ ...config, accountType: 'Savings' });
    this.interestRate = 4.0;
  }
  getMinimumBalance() {
    return 500;
  }
}

class CurrentAccount extends BankAccount {
  constructor(config = {}) {
    super({ ...config, accountType: 'Current' });
    this.overdraftLimit = 25000;
  }
  getMinimumBalance() {
    return 1000;
  }
}

/**
 * Computer Graphics Engine: HTML5 Canvas 2D Charts
 */
class ComputerGraphicsEngine {
  static drawBarChart(canvasId, accounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 600) * dpr;
    canvas.height = (rect.height || 320) * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    if (!accounts || accounts.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No accounts available for graph.', width / 2, height / 2);
      return;
    }

    const padding = { top: 35, right: 30, bottom: 55, left: 75 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...accounts.map(a => a.getBalance()), 2000);
    const niceMax = Math.ceil(maxVal / 1000) * 1000;

    // Y Gridlines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const val = Math.round((niceMax / 5) * i);
      const y = padding.top + chartH - (chartH * (val / niceMax));

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillText('₹' + val.toLocaleString('en-IN'), padding.left - 8, y + 4);
    }

    // Axes
    ctx.strokeStyle = '#0b3b60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    // Bars
    const totalBars = accounts.length;
    const barWidth = Math.min((chartW / totalBars) * 0.65, 50);
    const gap = chartW / totalBars;

    accounts.forEach((acc, index) => {
      const barHeight = (acc.getBalance() / niceMax) * chartH;
      const x = padding.left + (index * gap) + (gap - barWidth) / 2;
      const y = padding.top + chartH - barHeight;

      const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      grad.addColorStop(0, '#0b3b60');
      grad.addColorStop(1, '#0056b3');

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Value label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('₹' + acc.getBalance().toLocaleString('en-IN'), x + barWidth / 2, Math.max(y - 6, padding.top - 5));

      // X Label
      ctx.fillStyle = '#334155';
      ctx.font = '11px sans-serif';
      const shortName = acc.holderName.split(' ')[0];
      ctx.fillText(shortName, x + barWidth / 2, padding.top + chartH + 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9.5px monospace';
      ctx.fillText(acc.accountNumber.slice(-4), x + barWidth / 2, padding.top + chartH + 32);
    });
  }

  static drawPieChart(canvasId, accounts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 360) * dpr;
    canvas.height = (rect.height || 320) * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, width, height);

    let savingsCount = 0;
    let currentCount = 0;

    accounts.forEach(a => {
      if (a.accountType.toLowerCase().includes('saving')) savingsCount++;
      else currentCount++;
    });

    const total = savingsCount + currentCount;
    if (total === 0) return;

    const centerX = width / 2;
    const centerY = height / 2 - 12;
    const radius = Math.min(centerX, centerY) - 30;

    const slices = [
      { label: 'Savings', count: savingsCount, color: '#0b3b60' },
      { label: 'Current', count: currentCount, color: '#f37021' }
    ];

    let startAngle = -Math.PI / 2;

    slices.forEach(slice => {
      if (slice.count === 0) return;
      const sliceAngle = (slice.count / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const pct = Math.round((slice.count / total) * 100);
      const labelX = centerX + Math.cos(midAngle) * (radius * 0.65);
      const labelY = centerY + Math.sin(midAngle) * (radius * 0.65);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${pct}%`, labelX, labelY);

      startAngle += sliceAngle;
    });

    // Legend
    const legendY = height - 26;
    ctx.font = '11.5px sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#0b3b60';
    ctx.fillRect(centerX - 110, legendY, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Savings: ${savingsCount}`, centerX - 92, legendY + 10);

    ctx.fillStyle = '#f37021';
    ctx.fillRect(centerX + 20, legendY, 12, 12);
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`Current: ${currentCount}`, centerX + 38, legendY + 10);
  }
}

class CoreBankingManager {
  static STORAGE_ACCOUNTS = 'mahabank_master_accounts_v5';
  static STORAGE_OFFICERS = 'mahabank_master_officers_v5';
  static STORAGE_COMPLAINTS = 'mahabank_master_complaints_v5';

  constructor() {
    this.accounts = [];
    this.officers = [];
    this.complaints = [];
    // CRITICAL: activeSession is null by default. No user is shown until authenticated!
    this.activeSession = null; // { user: User, role: 'CUSTOMER' | 'OFFICER', accountNumber?: string }
    this.activeAccountNo = null;
    this.loadData();
  }

  loadData() {
    // 1. Load Accounts
    try {
      const dataStr = localStorage.getItem(CoreBankingManager.STORAGE_ACCOUNTS);
      if (dataStr) {
        const parsed = JSON.parse(dataStr);
        this.accounts = parsed.map(a => {
          const isSavings = a.accountType && a.accountType.toLowerCase().includes('saving');
          const acc = isSavings ? new SavingsAccount(a) : new CurrentAccount(a);
          
          // Backwards compatibility safeguard for seed demo accounts if stored without auth credentials
          if (!acc.passwordHash) {
            if (acc.accountNumber === '1001248921' || acc.username === 'amit') {
              acc.username = 'amit';
              acc.passwordSalt = 'c1810bb3b5ffe7d1';
              acc.passwordHash = 'd86d799de31b32ba2e579da00d54402f3203c3b63d2a27291463f1854034a4bb'; // Password@123
            } else if (acc.accountNumber === '1001248922' || acc.username === 'priya') {
              acc.username = 'priya';
              acc.passwordSalt = '08816d396d979539';
              acc.passwordHash = '92623547377540a3e5f4da2e3292c191eb07a64f4148f0171be401f6cbc4eeee'; // Password@123
            } else if (acc.accountNumber === '1001248923' || acc.username === 'suresh') {
              acc.username = 'suresh';
              acc.passwordSalt = '9bcae3bee9db85bd';
              acc.passwordHash = 'e97fd8258fc45b2c4c00e8c9a8e889d7b3c36ab2f2ed97ddff2258d2cfd98f78'; // Password@123
            }
          }
          return acc;
        });
        this.saveAccounts();
      }
    } catch (e) {
      console.warn('Could not load accounts from localStorage', e);
    }

    if (!this.accounts || this.accounts.length === 0) {
      this.accounts = this.getSeedAccounts();
      this.saveAccounts();
    }

    // 2. Load Officers
    try {
      const offStr = localStorage.getItem(CoreBankingManager.STORAGE_OFFICERS);
      if (offStr) {
        const parsedOff = JSON.parse(offStr);
        this.officers = parsedOff.map(o => new BankOfficer(o));
      }
    } catch (e) {
      console.warn('Could not load officers from localStorage', e);
    }

    if (!this.officers || this.officers.length === 0) {
      this.officers = this.getSeedOfficers();
      this.saveOfficers();
    }

    // 3. Load Complaints
    try {
      const cmpStr = localStorage.getItem(CoreBankingManager.STORAGE_COMPLAINTS);
      if (cmpStr) {
        const parsedCmp = JSON.parse(cmpStr);
        this.complaints = parsedCmp.map(c => new Complaint(c));
      }
    } catch (e) {
      console.warn('Could not load complaints from localStorage', e);
    }

    if (!this.complaints || this.complaints.length === 0) {
      this.complaints = this.getSeedComplaints();
      this.saveComplaints();
    }
  }

  getSeedAccounts() {
    const acc1 = new SavingsAccount({
      accountNumber: '1001248921',
      username: 'amit',
      passwordSalt: 'c1810bb3b5ffe7d1',
      passwordHash: 'd86d799de31b32ba2e579da00d54402f3203c3b63d2a27291463f1854034a4bb', // Password@123
      holderName: 'Amit Balu Patil',
      email: 'amit.patil@example.com',
      phoneNumber: '9822012345',
      balance: 48750.00,
      status: 'ACTIVE'
    });
    acc1.deposit(48750, 'Opening Deposit & Dairy Collective Credit');

    const acc2 = new CurrentAccount({
      accountNumber: '1001248922',
      username: 'priya',
      passwordSalt: '08816d396d979539',
      passwordHash: '92623547377540a3e5f4da2e3292c191eb07a64f4148f0171be401f6cbc4eeee', // Password@123
      holderName: 'Priya Ganesh Deshmukh',
      email: 'priya.deshmukh@example.com',
      phoneNumber: '9423045678',
      balance: 135800.00,
      status: 'ACTIVE'
    });
    acc2.deposit(135800, 'Opening Commercial Deposit');

    const acc3 = new SavingsAccount({
      accountNumber: '1001248923',
      username: 'suresh',
      passwordSalt: '9bcae3bee9db85bd',
      passwordHash: 'e97fd8258fc45b2c4c00e8c9a8e889d7b3c36ab2f2ed97ddff2258d2cfd98f78', // Password@123
      holderName: 'Suresh Vitthal Kadam',
      email: 'suresh.k@example.com',
      phoneNumber: '9890188231',
      balance: 12400.00,
      status: 'ACTIVE'
    });
    acc3.deposit(12400, 'Opening Savings Deposit');

    return [acc1, acc2, acc3];
  }

  getSeedOfficers() {
    return [
      new BankOfficer({
        officerId: 'OFF-1245',
        username: 'officer',
        passwordSalt: 'f4a812e95b0c7d31',
        passwordHash: '3c4bf52b447e67ab68977430d54ee27127d76eedbd68be05529c84a42e6e035b', // Password@123
        fullName: 'Rajesh V. Deshpande',
        designation: 'Branch Manager / Senior CBS Officer',
        branchCode: '1245',
        branchName: 'Baramati Branch (1245)',
        email: 'rajesh.deshpande@mahabank.in',
        phoneNumber: '9822199887'
      })
    ];
  }

  getSeedComplaints() {
    return [
      new Complaint({
        id: 'CMP-104928',
        accountNumber: '1001248921',
        customerName: 'Amit Patil',
        category: 'ATM',
        subject: 'Amount debited but cash not dispensed at ATM',
        description: 'Attempted to withdraw Rs. 2,000 on 18th Oct. Received SMS but cash failed to dispense.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        status: 'PENDING',
        resolution: ''
      })
    ];
  }

  saveAccounts() {
    try {
      localStorage.setItem(CoreBankingManager.STORAGE_ACCOUNTS, JSON.stringify(this.accounts.map(a => typeof a.toJSON === 'function' ? a.toJSON() : a)));
    } catch (e) {
      console.error('Error saving accounts', e);
    }
  }

  saveOfficers() {
    try {
      localStorage.setItem(CoreBankingManager.STORAGE_OFFICERS, JSON.stringify(this.officers.map(o => typeof o.toJSON === 'function' ? o.toJSON() : o)));
    } catch (e) {
      console.error('Error saving officers', e);
    }
  }

  saveComplaints() {
    try {
      localStorage.setItem(CoreBankingManager.STORAGE_COMPLAINTS, JSON.stringify(this.complaints.map(c => typeof c.toJSON === 'function' ? c.toJSON() : c)));
    } catch (e) {
      console.error('Error saving complaints', e);
    }
  }

  // ==========================================
  // ROLE-BASED ACCESS CONTROL (RBAC) GUARDS
  // Backend Security: Checks role before execution
  // ==========================================
  requireAuth() {
    if (!this.activeSession || !this.activeSession.user) {
      throw new Error('Access Denied: Please log in to perform this operation.');
    }
    return this.activeSession;
  }

  requireOfficer() {
    this.requireAuth();
    if (this.activeSession.role !== 'OFFICER') {
      throw new Error('Access Denied: Bank Officer privileges required for this operation.');
    }
    return this.activeSession.user;
  }

  requireCustomer() {
    this.requireAuth();
    if (this.activeSession.role !== 'CUSTOMER') {
      throw new Error('Access Denied: Customer authorization required for this operation.');
    }
    return this.activeSession.user;
  }

  getActiveUser() {
    return this.activeSession ? this.activeSession.user : null;
  }

  getActiveRole() {
    return this.activeSession ? this.activeSession.role : null;
  }

  isOfficerLoggedIn() {
    return !!(this.activeSession && this.activeSession.role === 'OFFICER');
  }

  isCustomerLoggedIn() {
    return !!(this.activeSession && this.activeSession.role === 'CUSTOMER');
  }

  // ==========================================
  // AUTHENTICATION WORKFLOWS
  // ==========================================
  async authenticateCustomer(identifier, password) {
    const cleanId = String(identifier).toLowerCase().trim();
    if (!cleanId) {
      throw new Error('Please enter your Username or 10-digit Account Number.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const acc = this.accounts.find(a =>
      a.accountNumber.toLowerCase() === cleanId ||
      (a.username && a.username.toLowerCase() === cleanId)
    );

    if (!acc) {
      throw new Error('No customer account found with this Username or Account Number. If you are a Bank Officer, please use the Bank Officer Login tab.');
    }

    if (!acc.isActive()) {
      throw new Error('This customer account is currently DEACTIVATED / FROZEN. Please contact your home branch.');
    }

    const computedHash = await CryptoHelper.hashPassword(password, acc.passwordSalt);
    if (computedHash !== acc.passwordHash) {
      throw new Error('Incorrect password. Please verify your customer credentials and try again.');
    }

    const customerUser = new Customer({
      username: acc.username,
      passwordHash: acc.passwordHash,
      passwordSalt: acc.passwordSalt,
      fullName: acc.holderName,
      email: acc.email,
      phoneNumber: acc.phoneNumber,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      createdDate: acc.createdDate
    });

    this.activeSession = {
      user: customerUser,
      role: 'CUSTOMER',
      accountNumber: acc.accountNumber
    };
    this.activeAccountNo = acc.accountNumber;

    return { user: customerUser, account: acc };
  }

  async authenticateOfficer(identifier, password) {
    const cleanId = String(identifier).toLowerCase().trim();
    if (!cleanId) {
      throw new Error('Please enter your Officer ID or Username.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const officer = this.officers.find(o =>
      o.username.toLowerCase() === cleanId ||
      (o.officerId && o.officerId.toLowerCase() === cleanId)
    );

    if (!officer) {
      throw new Error('Invalid Bank Officer credentials. If you are a retail customer, please use the Customer Login tab.');
    }

    const computedHash = await CryptoHelper.hashPassword(password, officer.passwordSalt);
    if (computedHash !== officer.passwordHash) {
      throw new Error('Incorrect officer password. Unauthorized access attempts are monitored and logged.');
    }

    this.activeSession = {
      user: officer,
      role: 'OFFICER'
    };
    this.activeAccountNo = null;

    return { user: officer };
  }

  /**
   * Universal authenticate for backward compatibility or auto-detection
   */
  async authenticate(identifier, password, preferredRole = null) {
    if (preferredRole === 'OFFICER') {
      return (await this.authenticateOfficer(identifier, password)).user;
    }
    if (preferredRole === 'CUSTOMER') {
      return (await this.authenticateCustomer(identifier, password)).account;
    }

    // Try customer first
    try {
      const res = await this.authenticateCustomer(identifier, password);
      return res.account;
    } catch (custErr) {
      // If not customer, check if officer
      const isOfficerMatch = this.officers.some(o =>
        o.username.toLowerCase() === String(identifier).toLowerCase().trim() ||
        (o.officerId && o.officerId.toLowerCase() === String(identifier).toLowerCase().trim())
      );
      if (isOfficerMatch) {
        const offRes = await this.authenticateOfficer(identifier, password);
        return offRes.user;
      }
      throw custErr;
    }
  }

  logout() {
    this.activeSession = null;
    this.activeAccountNo = null;
  }

  // ==========================================
  // CUSTOMER SELF-REGISTRATION
  // ==========================================
  async createAccount({ holderName, username, email = '', phoneNumber = '', accountType = 'Savings', openingDeposit = 500, password }) {
    const cleanUsername = String(username).toLowerCase().trim();
    const cleanName = String(holderName).trim();

    if (!cleanName) {
      throw new Error('Please enter the account holder full name.');
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Check unique username across accounts and officers
    const existing = this.accounts.find(a => a.username && a.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error(`Username "${cleanUsername}" is already taken. Please choose another username.`);
    }

    const isOfficerUsername = this.officers.some(o => o.username && o.username.toLowerCase() === cleanUsername);
    if (isOfficerUsername) {
      throw new Error(`Username "${cleanUsername}" is reserved for Bank Officers.`);
    }

    // Generate unique 10-digit account number (1001XXXXXX)
    let newAccNo;
    do {
      newAccNo = '1001' + Math.floor(100000 + Math.random() * 900000);
    } while (this.accounts.some(a => a.accountNumber === newAccNo));

    const salt = CryptoHelper.generateSalt(16);
    const passwordHash = await CryptoHelper.hashPassword(password, salt);

    const isSavings = accountType.toLowerCase().includes('saving');
    const minOpening = isSavings ? 500 : 1000;
    const depositNum = Math.max(Number(openingDeposit) || 0, minOpening);

    const newAccount = isSavings
      ? new SavingsAccount({
          accountNumber: newAccNo,
          username: cleanUsername,
          passwordSalt: salt,
          passwordHash: passwordHash,
          holderName: cleanName,
          email,
          phoneNumber,
          balance: 0
        })
      : new CurrentAccount({
          accountNumber: newAccNo,
          username: cleanUsername,
          passwordSalt: salt,
          passwordHash: passwordHash,
          holderName: cleanName,
          email,
          phoneNumber,
          balance: 0
        });

    if (depositNum > 0) {
      newAccount.deposit(depositNum, 'Opening Account Deposit');
    }

    this.accounts.unshift(newAccount);
    this.saveAccounts();
    return newAccount;
  }

  // ==========================================
  // BANK OFFICER PROTECTED OPERATIONS
  // Backend enforces requireOfficer()
  // ==========================================
  createAccountByOfficer(accountData) {
    this.requireOfficer(); // BACKEND SECURITY CHECK
    return this.createAccount(accountData);
  }

  deposit(accountNumber, amount, ref = 'Cash Deposit at Teller Counter', category = 'CASH') {
    this.requireOfficer(); // BACKEND SECURITY CHECK: Customer cannot call teller deposit directly
    const acc = this.findAccount(accountNumber);
    if (!acc) throw new Error(`Account number ${accountNumber} not found.`);
    const txn = acc.deposit(amount, ref, category);
    this.saveAccounts();
    return { account: acc, transaction: txn };
  }

  withdraw(accountNumber, amount, ref = 'Cash Withdrawal at Teller Counter', category = 'CASH') {
    this.requireOfficer(); // BACKEND SECURITY CHECK: Customer cannot call teller withdraw directly
    const acc = this.findAccount(accountNumber);
    if (!acc) throw new Error(`Account number ${accountNumber} not found.`);
    const txn = acc.withdraw(amount, null, ref, category);
    this.saveAccounts();
    return { account: acc, transaction: txn };
  }

  toggleAccountStatus(accountNumber) {
    this.requireOfficer(); // BACKEND SECURITY CHECK
    const acc = this.findAccount(accountNumber);
    if (!acc) throw new Error('Account not found');
    acc.status = acc.isActive() ? 'DEACTIVATED' : 'ACTIVE';
    this.saveAccounts();
    return acc;
  }

  searchAccounts(query) {
    this.requireOfficer(); // BACKEND SECURITY CHECK: Only officers can search customer database
    const q = String(query).toLowerCase().trim();
    if (!q) return this.accounts;
    return this.accounts.filter(a =>
      a.holderName.toLowerCase().includes(q) ||
      (a.username && a.username.toLowerCase().includes(q)) ||
      a.accountNumber.includes(q) ||
      a.phoneNumber.includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  }

  getAllAccounts() {
    this.requireOfficer(); // BACKEND SECURITY CHECK
    return this.accounts;
  }

  getAllTransactions() {
    this.requireOfficer(); // BACKEND SECURITY CHECK: Only officers can view complete CBS bank ledger
    let all = [];
    this.accounts.forEach(acc => {
      acc.transactions.forEach(t => all.push(t));
    });
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  resolveComplaint(complaintId, resolutionRemarks) {
    this.requireOfficer(); // BACKEND SECURITY CHECK: Only officers can resolve grievances
    const cmp = this.complaints.find(c => c.id === complaintId);
    if (!cmp) throw new Error(`Complaint ${complaintId} not found.`);
    cmp.resolve(resolutionRemarks || 'Resolved by MahaBank Branch Officer.');
    this.saveComplaints();
    return cmp;
  }

  getBranchStats() {
    this.requireOfficer(); // BACKEND SECURITY CHECK
    let totalDeposits = 0;
    let savingsCount = 0;
    let currentCount = 0;
    let activeCount = 0;
    let frozenCount = 0;

    this.accounts.forEach(a => {
      totalDeposits += a.getBalance();
      if (a.accountType.toLowerCase().includes('saving')) savingsCount++;
      else currentCount++;
      if (a.isActive()) activeCount++;
      else frozenCount++;
    });

    const pendingComplaints = this.complaints.filter(c => c.status === 'PENDING').length;

    return {
      totalDeposits,
      totalAccounts: this.accounts.length,
      savingsCount,
      currentCount,
      activeCount,
      frozenCount,
      pendingComplaints
    };
  }

  // ==========================================
  // CUSTOMER PROTECTED OPERATIONS
  // Scoped strictly to the authenticated customer
  // ==========================================
  customerTransfer({ recipient, amount, pin, mode = 'UPI', remarks = 'Fund Transfer' }) {
    this.requireCustomer(); // BACKEND SECURITY CHECK
    const acc = this.getActiveAccount();
    if (!acc) throw new Error('Active customer account not found.');
    const txn = acc.transfer({ amount, recipient, pin, mode, remarks });
    this.saveAccounts();
    return txn;
  }

  customerGetTransactions() {
    this.requireCustomer();
    const acc = this.getActiveAccount();
    if (!acc) return [];
    return acc.transactions.slice();
  }

  customerFileComplaint({ category, subject, description }) {
    this.requireCustomer();
    const acc = this.getActiveAccount();
    if (!acc) throw new Error('Customer session not found.');
    const cmp = new Complaint({
      accountNumber: acc.accountNumber,
      customerName: acc.holderName,
      category,
      subject,
      description
    });
    this.complaints.unshift(cmp);
    this.saveComplaints();
    return cmp;
  }

  customerGetComplaints() {
    this.requireCustomer();
    const acc = this.getActiveAccount();
    if (!acc) return [];
    return this.complaints.filter(c => c.accountNumber === acc.accountNumber);
  }

  getCustomerProfile() {
    this.requireCustomer();
    const acc = this.getActiveAccount();
    if (!acc) return null;
    return {
      accountNumber: acc.accountNumber,
      holderName: acc.holderName,
      username: acc.username,
      email: acc.email || 'N/A',
      phoneNumber: acc.phoneNumber || 'N/A',
      accountType: acc.accountType,
      balance: acc.getBalance(),
      formattedBalance: acc.getFormattedBalance(),
      ifscCode: acc.ifscCode,
      branchName: acc.branchName,
      status: acc.status,
      createdDate: acc.createdDate,
      customerId: 'CUST-' + acc.accountNumber.slice(-6),
      micrCode: '411014002',
      dailyUpiLimit: '₹ 1,00,000',
      rupayCardType: 'RuPay Platinum Global Debit Card',
      rupayStatus: acc.isActive() ? 'ACTIVE' : 'BLOCKED',
      kycStatus: 'VERIFIED (AADHAAR & PAN LINKED)',
      nomineeStatus: 'REGISTERED'
    };
  }

  // General Account Access
  getActiveAccount() {
    if (this.activeAccountNo) {
      return this.accounts.find(a => a.accountNumber === this.activeAccountNo) || null;
    }
    if (this.activeSession && this.activeSession.role === 'CUSTOMER' && this.activeSession.accountNumber) {
      return this.accounts.find(a => a.accountNumber === this.activeSession.accountNumber) || null;
    }
    return null;
  }

  findAccount(accountNumber) {
    const clean = String(accountNumber).trim();
    return this.accounts.find(a => a.accountNumber === clean) || null;
  }

  fileComplaint({ accountNumber, customerName, category, subject, description }) {
    const cmp = new Complaint({
      accountNumber,
      customerName,
      category,
      subject,
      description
    });
    this.complaints.unshift(cmp);
    this.saveComplaints();
    return cmp;
  }
}

// Global Core Banking Instance
if (typeof window !== 'undefined') {
  window.bankManager = new CoreBankingManager();
  window.ComputerGraphicsEngine = ComputerGraphicsEngine;
  window.CryptoHelper = CryptoHelper;
  window.User = User;
  window.Customer = Customer;
  window.BankOfficer = BankOfficer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CoreBankingManager,
    BankAccount,
    SavingsAccount,
    CurrentAccount,
    Transaction,
    Complaint,
    CryptoHelper,
    User,
    Customer,
    BankOfficer,
    ComputerGraphicsEngine
  };
}

