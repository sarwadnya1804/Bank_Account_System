/**
 * ============================================================================
 * MAHABANK - APPLICATION CONTROLLER (app.js)
 * 
 * Orchestrates:
 * 1. MahaBank Indian Banking UI & Navigation (10 Full Tabs)
 * 2. Create Account, Deposit, Withdraw, Check Balance, and Search workflows
 * 3. Electronic Fund Transfers (UPI, IMPS, NEFT)
 * 4. Computer Graphics 2D Canvas Engine (Bar Chart & Pie Chart)
 * 5. All Accounts & CBS Status Control (Activate/Deactivate)
 * 6. Bilingual Support: English (Default) & Marathi
 * 7. Bright & Dark Theme Switcher with localStorage persistence
 * ============================================================================
 */

class BankAppUI {
  constructor() {
    this.currentTab = 'tab-dashboard';
    this.currentLang = localStorage.getItem('mahabank_lang') || 'en';
    this.currentTheme = localStorage.getItem('mahabank_theme') || 'light';
    this.isBalanceVisible = true;

    // Bilingual Dictionary
    this.translations = {
      en: {
        rbi_badge: "RBI Advisory",
        rbi_text: "Bank never asks for confidential credentials like PIN, OTP, or CVV. Cyber Helpline: 1930",
        brand_tagline: "National Core Banking Management System",
        nav_dashboard: "Overview & RuPay Card",
        nav_create_account: "Create Account",
        nav_dep_wd: "Deposit / Withdraw",
        nav_check_balance: "Check Balance",
        nav_search: "Search Account",
        nav_transfer: "Fund Transfer (UPI)",
        nav_history: "Transaction History",
        nav_graphs: "Graphs (Computer Graphics)",
        nav_all_accounts: "All Accounts & CBS",
        nav_complaints: "Complaints & Helpdesk",
        lbl_available_bal: "Available Balance",
        lbl_acc_no: "ACCOUNT NUMBER",
        stat_credits: "Total Credits",
        stat_debits: "Total Debits",
        title_quick_services: "Quick Services",
        title_recent_txns: "Recent Transactions",
        title_create_account: "Create Account",
        lbl_holder_name: "Account holder name",
        lbl_email: "Email",
        lbl_phone: "Phone number",
        lbl_account_type: "Account type",
        lbl_opening_deposit: "Opening deposit (Rs.)",
        btn_create_account: "Create account",
        title_deposit_withdraw: "Deposit / Withdraw",
        lbl_account_number: "Account number",
        lbl_amount: "Amount (Rs.)",
        btn_deposit: "Deposit",
        btn_withdraw: "Withdraw",
        title_check_balance: "Check Balance",
        btn_show_balance: "Show balance",
        title_search_account: "Search Account",
        lbl_search_query: "Name, account number or phone",
        btn_search: "Search",
        title_transfer: "Fund Transfer",
        title_history: "Transaction History & Passbook",
        title_graphs: "Graphs (Computer Graphics)",
        title_all_accounts: "All Accounts & Status Control",
        title_complaints: "Complaints & Helpdesk"
      },
      mr: {
        rbi_badge: "RBI सुरक्षा सूचना",
        rbi_text: "बँक कधीही आपला OTP, PIN किंवा पासवर्ड विचारत नाही. सायबर हेल्पलाईन: 1930",
        brand_tagline: "राष्ट्रीय कोर बँकिंग आणि नेटबँकिंग प्रणाली",
        nav_dashboard: "मुख्य आढावा व RuPay कार्ड",
        nav_create_account: "नवीन खाते उघडा (Create)",
        nav_dep_wd: "पैसे भरा / काढा (Deposit/WD)",
        nav_check_balance: "बॅलन्स तपासा (Check Balance)",
        nav_search: "खाते शोधा (Search)",
        nav_transfer: "पैसे पाठवा (UPI Transfer)",
        nav_history: "व्यवहार इतिहास (Passbook)",
        nav_graphs: "आलेख व विश्लेषण (Graphs)",
        nav_all_accounts: "सर्व खाती व CBS",
        nav_complaints: "तक्रार निवारण (Helpdesk)",
        lbl_available_bal: "उपलब्ध शिल्लक",
        lbl_acc_no: "खाते क्रमांक",
        stat_credits: "एकूण जमा (Credits)",
        stat_debits: "एकूण खर्च (Debits)",
        title_quick_services: "त्वरित बँकिंग सेवा",
        title_recent_txns: "नुकतेच झालेले व्यवहार",
        title_create_account: "नवीन बँक खाते उघडा",
        lbl_holder_name: "खातेदाराचे नाव",
        lbl_email: "ईमेल पत्ता",
        lbl_phone: "मोबाईल नंबर (१० अंकी)",
        lbl_account_type: "खात्याचा प्रकार",
        lbl_opening_deposit: "सुरुवातीची ठेव रक्कम (रु.)",
        btn_create_account: "खाते तयार करा",
        title_deposit_withdraw: "पैसे जमा करा / काढा",
        lbl_account_number: "खाते क्रमांक (१० अंकी)",
        lbl_amount: "रक्कम (रु.)",
        btn_deposit: "जमा करा (Deposit)",
        btn_withdraw: "पैसे काढा (Withdraw)",
        title_check_balance: "खाते शिल्लक तपासा",
        btn_show_balance: "शिल्लक दाखवा",
        title_search_account: "खाते शोधक",
        lbl_search_query: "नाव, खाते क्रमांक किंवा फोन",
        btn_search: "शोधा (Search)",
        title_transfer: "पैसे ट्रान्सफर करा",
        title_history: "खाते विवरण व ई-पासबुक",
        title_graphs: "ग्राफिक्स व आलेख (Computer Graphics)",
        title_all_accounts: "सर्व खाती व नियंत्रण",
        title_complaints: "तक्रार निवारण कक्ष"
      }
    };
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.applyLanguage(this.currentLang);
    this.setupListeners();

    // Check if an authenticated session exists in sessionStorage
    const sessionStr = sessionStorage.getItem('mahabank_session');
    let sessionUser = null;
    if (sessionStr) {
      try {
        sessionUser = JSON.parse(sessionStr);
      } catch (e) {
        sessionStorage.removeItem('mahabank_session');
      }
    }

    if (sessionUser && sessionUser.role === 'OFFICER') {
      const officer = window.bankManager.officers.find(o =>
        o.officerId === sessionUser.officerId ||
        o.username === sessionUser.username
      );
      if (officer) {
        window.bankManager.activeSession = { user: officer, role: 'OFFICER' };
        window.bankManager.activeAccountNo = null;
        this.showOfficerDashboardView();
      } else {
        sessionStorage.removeItem('mahabank_session');
        window.bankManager.logout();
        this.showAuthView();
      }
    } else if (sessionUser && (sessionUser.role === 'CUSTOMER' || sessionUser.accountNumber)) {
      const accNo = sessionUser.accountNumber;
      const matched = window.bankManager.findAccount(accNo);
      if (matched && matched.isActive()) {
        const custUser = new Customer({
          username: matched.username,
          passwordHash: matched.passwordHash,
          passwordSalt: matched.passwordSalt,
          fullName: matched.holderName,
          email: matched.email,
          phoneNumber: matched.phoneNumber,
          accountNumber: matched.accountNumber,
          accountType: matched.accountType,
          createdDate: matched.createdDate
        });
        window.bankManager.activeSession = {
          user: custUser,
          role: 'CUSTOMER',
          accountNumber: matched.accountNumber
        };
        window.bankManager.activeAccountNo = matched.accountNumber;
        this.showCustomerDashboardView();
      } else {
        sessionStorage.removeItem('mahabank_session');
        window.bankManager.logout();
        this.showAuthView();
      }
    } else {
      window.bankManager.logout();
      this.showAuthView();
    }

    window.addEventListener('resize', () => {
      if (this.currentTab === 'tab-graphs') {
        this.renderAllGraphs();
      }
    });
  }

  // ==========================================
  // AUTHENTICATION & SESSION CONTROLS
  // ==========================================
  isAuthenticated() {
    return !!(window.bankManager && window.bankManager.activeSession && window.bankManager.activeSession.user);
  }

  isOfficer() {
    return !!(window.bankManager && window.bankManager.isOfficerLoggedIn());
  }

  isCustomer() {
    return !!(window.bankManager && window.bankManager.isCustomerLoggedIn());
  }

  showAuthView() {
    const authPortal = document.getElementById('authPortal');
    const mainApp = document.getElementById('mainAppContainer');
    if (authPortal) authPortal.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
    this.switchAuthTab('customer-login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showCustomerDashboardView() {
    const authPortal = document.getElementById('authPortal');
    const mainApp = document.getElementById('mainAppContainer');
    if (authPortal) authPortal.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');

    this.setNavigationForRole('CUSTOMER');
    this.renderDashboardData();
    this.renderCustomerProfile();
    this.refreshCustomerBalance();
    this.renderTransactionHistory();
    this.renderComplaintsList();
    this.switchTab('tab-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showOfficerDashboardView() {
    const authPortal = document.getElementById('authPortal');
    const mainApp = document.getElementById('mainAppContainer');
    if (authPortal) authPortal.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');

    this.setNavigationForRole('OFFICER');
    this.renderOfficerOverview();
    this.renderAllAccountsTable();
    this.renderOfficerTransactions();
    this.renderComplaintsList();
    this.switchTab('tab-officer-overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDashboardView() {
    if (this.isOfficer()) {
      this.showOfficerDashboardView();
    } else {
      this.showCustomerDashboardView();
    }
  }

  setNavigationForRole(role) {
    const topAvatar = document.querySelector('#userPill .user-avatar');
    const topName = document.getElementById('topUserName');
    const topType = document.getElementById('topAccountType');

    if (role === 'OFFICER') {
      const officer = window.bankManager.getActiveUser();
      if (topAvatar) topAvatar.innerHTML = '<i class="fa-solid fa-user-shield" style="color:#f37021;"></i>';
      if (topName) topName.innerText = officer ? officer.fullName : 'Rajesh V. Deshpande';
      if (topType) topType.innerText = officer ? `${officer.designation} (${officer.officerId})` : 'Branch Officer (OFF-1245)';

      // Hide customer-only items, show officer items
      document.querySelectorAll('.role-customer').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.role-officer').forEach(el => el.style.display = '');
    } else {
      const acc = window.bankManager.getActiveAccount();
      if (topAvatar) topAvatar.innerHTML = '<i class="fa-solid fa-user-check" style="color:#0a8754;"></i>';
      if (topName) topName.innerText = acc ? acc.holderName : 'Customer';
      if (topType) topType.innerText = acc ? `${acc.accountType} A/C (${acc.accountNumber})` : 'Savings A/C';

      // Hide officer-only items, show customer items
      document.querySelectorAll('.role-officer').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.role-customer').forEach(el => el.style.display = '');
    }
  }

  switchAuthTab(tab) {
    const custTabBtn = document.getElementById('authTabCustomerLogin');
    const officerTabBtn = document.getElementById('authTabOfficerLogin');
    const regTabBtn = document.getElementById('authTabRegister');

    const custPanel = document.getElementById('customerLoginPanel');
    const officerPanel = document.getElementById('officerLoginPanel');
    const regPanel = document.getElementById('registerPanel');
    const regSuccessPanel = document.getElementById('regSuccessPanel');

    // Legacy fallbacks
    const legacyLoginBtn = document.getElementById('authTabLoginBtn');
    const legacyRegBtn = document.getElementById('authTabRegisterBtn');
    const legacyLoginPanel = document.getElementById('loginPanel');

    this.hideAuthErrors();

    // Reset active buttons
    [custTabBtn, officerTabBtn, regTabBtn, legacyLoginBtn, legacyRegBtn].forEach(b => {
      if (b) b.classList.remove('active');
    });

    // Hide all panels
    [custPanel, officerPanel, regPanel, regSuccessPanel, legacyLoginPanel].forEach(p => {
      if (p) p.classList.add('hidden');
    });

    if (tab === 'customer-login' || tab === 'login') {
      if (custTabBtn) custTabBtn.classList.add('active');
      if (legacyLoginBtn) legacyLoginBtn.classList.add('active');
      if (custPanel) custPanel.classList.remove('hidden');
      else if (legacyLoginPanel) legacyLoginPanel.classList.remove('hidden');
      const input = document.getElementById('customerLoginIdentifier') || document.getElementById('loginIdentifier');
      if (input) setTimeout(() => input.focus(), 60);
    } else if (tab === 'officer-login') {
      if (officerTabBtn) officerTabBtn.classList.add('active');
      if (officerPanel) officerPanel.classList.remove('hidden');
      const input = document.getElementById('officerLoginIdentifier');
      if (input) setTimeout(() => input.focus(), 60);
    } else if (tab === 'register') {
      if (regTabBtn) regTabBtn.classList.add('active');
      if (legacyRegBtn) legacyRegBtn.classList.add('active');
      if (regPanel) regPanel.classList.remove('hidden');
      const input = document.getElementById('regFullName');
      if (input) setTimeout(() => input.focus(), 60);
    } else if (tab === 'success') {
      if (regSuccessPanel) regSuccessPanel.classList.remove('hidden');
    }
  }

  hideAuthErrors() {
    ['customerLoginErrorBox', 'officerLoginErrorBox', 'loginErrorBox', 'regErrorBox'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }

  showLoginError(msg, type = 'customer') {
    if (type === 'officer') {
      const errBox = document.getElementById('officerLoginErrorBox');
      const errMsg = document.getElementById('officerLoginErrorMsg');
      if (errBox && errMsg) {
        errMsg.innerText = msg;
        errBox.classList.remove('hidden');
      }
    } else {
      const errBox = document.getElementById('customerLoginErrorBox') || document.getElementById('loginErrorBox');
      const errMsg = document.getElementById('customerLoginErrorMsg') || document.getElementById('loginErrorMsg');
      if (errBox && errMsg) {
        errMsg.innerText = msg;
        errBox.classList.remove('hidden');
      }
    }
  }

  showRegisterError(msg) {
    const errBox = document.getElementById('regErrorBox');
    const errMsg = document.getElementById('regErrorMsg');
    if (errBox && errMsg) {
      errMsg.innerText = msg;
      errBox.classList.remove('hidden');
    }
  }

  async handleCustomerLoginSubmit(event) {
    if (event) event.preventDefault();
    this.hideAuthErrors();

    const idInput = document.getElementById('customerLoginIdentifier') || document.getElementById('loginIdentifier');
    const pwdInput = document.getElementById('customerLoginPassword') || document.getElementById('loginPassword');
    const submitBtn = document.getElementById('btnCustomerLoginSubmit') || document.getElementById('btnLoginSubmit');

    const identifier = idInput ? idInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';

    if (!identifier) {
      this.showLoginError('Please enter your Username or 10-digit Account Number.', 'customer');
      if (idInput) idInput.focus();
      return;
    }

    if (!password) {
      this.showLoginError('Please enter your customer password.', 'customer');
      if (pwdInput) pwdInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Verifying Customer Credentials...</span>';
    }

    try {
      const res = await window.bankManager.authenticateCustomer(identifier, password);
      const account = res.account;

      sessionStorage.setItem('mahabank_session', JSON.stringify({
        role: 'CUSTOMER',
        accountNumber: account.accountNumber,
        username: account.username,
        holderName: account.holderName,
        loginTime: new Date().toISOString()
      }));

      if (pwdInput) pwdInput.value = '';
      this.showToast(`Welcome back, ${account.holderName}! Customer login successful.`, 'success');
      this.showCustomerDashboardView();
    } catch (err) {
      this.showLoginError(err.message || 'Authentication failed. Please verify credentials.', 'customer');
      this.showToast(err.message || 'Login failed', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> <span>Secure Customer Sign In</span>';
      }
    }
  }

  async handleOfficerLoginSubmit(event) {
    if (event) event.preventDefault();
    this.hideAuthErrors();

    const idInput = document.getElementById('officerLoginIdentifier');
    const pwdInput = document.getElementById('officerLoginPassword');
    const submitBtn = document.getElementById('btnOfficerLoginSubmit');

    const identifier = idInput ? idInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';

    if (!identifier) {
      this.showLoginError('Please enter your Officer ID or Username.', 'officer');
      if (idInput) idInput.focus();
      return;
    }

    if (!password) {
      this.showLoginError('Please enter your officer authorization password.', 'officer');
      if (pwdInput) pwdInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Authenticating CBS Officer Credentials...</span>';
    }

    try {
      const res = await window.bankManager.authenticateOfficer(identifier, password);
      const officer = res.user;

      sessionStorage.setItem('mahabank_session', JSON.stringify({
        role: 'OFFICER',
        officerId: officer.officerId,
        username: officer.username,
        fullName: officer.fullName,
        designation: officer.designation,
        branchCode: officer.branchCode,
        loginTime: new Date().toISOString()
      }));

      if (pwdInput) pwdInput.value = '';
      this.showToast(`Welcome, Officer ${officer.fullName}! Officer CBS authorized.`, 'success');
      this.showOfficerDashboardView();
    } catch (err) {
      this.showLoginError(err.message || 'Officer authorization failed.', 'officer');
      this.showToast(err.message || 'Officer login failed', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <span>Authenticate Officer Access</span>';
      }
    }
  }

  // Fallback for universal submit button
  handleLoginSubmit(event) {
    return this.handleCustomerLoginSubmit(event);
  }

  async handleRegisterSubmit(event) {
    if (event) event.preventDefault();
    this.hideAuthErrors();

    const fullNameInput = document.getElementById('regFullName');
    const usernameInput = document.getElementById('regUsername');
    const accountTypeInput = document.getElementById('regAccountType');
    const depositInput = document.getElementById('regOpeningDeposit');
    const phoneInput = document.getElementById('regPhoneNumber');
    const pwdInput = document.getElementById('regPassword');
    const confirmPwdInput = document.getElementById('regConfirmPassword');
    const submitBtn = document.getElementById('btnRegisterSubmit');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
    const accountType = accountTypeInput ? accountTypeInput.value : 'Savings';
    const deposit = depositInput ? Number(depositInput.value) : 500;
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';
    const confirmPassword = confirmPwdInput ? confirmPwdInput.value : '';

    if (!fullName) {
      this.showRegisterError('Please enter your full name.');
      if (fullNameInput) fullNameInput.focus();
      return;
    }

    if (!username || username.length < 3) {
      this.showRegisterError('Username must be at least 3 characters long.');
      if (usernameInput) usernameInput.focus();
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.showRegisterError('Username can only contain letters, numbers, and underscores.');
      if (usernameInput) usernameInput.focus();
      return;
    }

    const minReq = accountType === 'Current' ? 1000 : 500;
    if (deposit < minReq) {
      this.showRegisterError(`Minimum opening deposit for ${accountType} Account is ₹ ${minReq.toLocaleString('en-IN')}.`);
      if (depositInput) depositInput.focus();
      return;
    }

    if (!password || password.length < 6) {
      this.showRegisterError('Password must be at least 6 characters long.');
      if (pwdInput) pwdInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      this.showRegisterError('Passwords do not match. Please re-enter.');
      if (confirmPwdInput) confirmPwdInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Creating Secure Account...</span>';
    }

    try {
      const newAcc = await window.bankManager.createAccount({
        holderName: fullName,
        username: username,
        phoneNumber: phone,
        accountType: accountType,
        openingDeposit: deposit,
        password: password
      });

      const sHolder = document.getElementById('successHolderName');
      const sAcc = document.getElementById('successAccNumber');
      const sUser = document.getElementById('successUsername');
      const sType = document.getElementById('successAccType');
      const sBal = document.getElementById('successBalance');

      if (sHolder) sHolder.innerText = newAcc.holderName;
      if (sAcc) sAcc.innerText = newAcc.accountNumber;
      if (sUser) sUser.innerText = newAcc.username;
      if (sType) sType.innerText = `${newAcc.accountType} A/C`;
      if (sBal) sBal.innerText = newAcc.getFormattedBalance();

      this.createdTempUsername = newAcc.username;
      this.createdTempAccNo = newAcc.accountNumber;

      const regForm = document.getElementById('authRegisterForm');
      if (regForm) regForm.reset();

      this.switchAuthTab('success');
      this.showToast(`Account ${newAcc.accountNumber} created successfully!`, 'success');
      if (window.voiceBot) window.voiceBot.playChime('success');
    } catch (err) {
      this.showRegisterError(err.message || 'Could not register account. Please try again.');
      this.showToast(err.message || 'Registration failed', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> <span>Create My MahaBank Account</span>';
      }
    }
  }

  proceedFromRegistration() {
    this.switchAuthTab('customer-login');
    const idInput = document.getElementById('customerLoginIdentifier') || document.getElementById('loginIdentifier');
    if (idInput && (this.createdTempUsername || this.createdTempAccNo)) {
      idInput.value = this.createdTempUsername || this.createdTempAccNo;
    }
    const pwdInput = document.getElementById('customerLoginPassword') || document.getElementById('loginPassword');
    if (pwdInput) {
      pwdInput.value = '';
      setTimeout(() => pwdInput.focus(), 60);
    }
  }

  fillDemoCustomerLogin(identifier, password) {
    this.switchAuthTab('customer-login');
    const idInput = document.getElementById('customerLoginIdentifier') || document.getElementById('loginIdentifier');
    const pwdInput = document.getElementById('customerLoginPassword') || document.getElementById('loginPassword');
    if (idInput) idInput.value = identifier;
    if (pwdInput) pwdInput.value = password;
    this.showToast(`Customer demo credentials filled for "${identifier}". Click Sign In to log in.`, 'info');
  }

  fillDemoOfficerLogin(identifier, password) {
    this.switchAuthTab('officer-login');
    const idInput = document.getElementById('officerLoginIdentifier');
    const pwdInput = document.getElementById('officerLoginPassword');
    if (idInput) idInput.value = identifier;
    if (pwdInput) pwdInput.value = password;
    this.showToast(`Officer demo credentials filled for "${identifier}". Click Authenticate to log in.`, 'info');
  }

  fillDemoLogin(identifier, password) {
    this.fillDemoCustomerLogin(identifier, password);
  }

  togglePwdVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (icon) icon.className = 'fa-regular fa-eye';
    } else {
      input.type = 'password';
      if (icon) icon.className = 'fa-regular fa-eye-slash';
    }
  }

  handleLogout() {
    sessionStorage.removeItem('mahabank_session');
    if (window.bankManager) {
      window.bankManager.logout();
    }
    this.showToast('You have been logged out securely.', 'info');
    this.showAuthView();
  }

  setupListeners() {
    // Nav Tab Buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        this.switchTab(target);
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Language Toggle
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => this.toggleLanguage());
    }

    // Balance visibility toggle
    const eyeBtn = document.getElementById('toggleBalanceVisibility');
    if (eyeBtn) {
      eyeBtn.addEventListener('click', () => this.toggleBalanceVisibility());
    }

    // Voice triggers
    const voiceBtn = document.getElementById('headerVoiceBtn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (window.voiceBot) window.voiceBot.startListening();
      });
    }

    // Global Search (Ctrl+K)
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          searchInput.focus();
        }
      });
      document.addEventListener('click', (e) => {
        const dd = document.getElementById('searchDropdown');
        if (dd && !e.target.closest('.header-search')) {
          dd.classList.remove('active');
        }
      });
    }
  }

  // ==========================================
  // TAB NAVIGATION (With Strict Role & Auth Guard)
  // ==========================================
  switchTab(tabId) {
    if (!this.isAuthenticated()) {
      this.showAuthView();
      this.showToast('Please login to access banking services.', 'error');
      return;
    }

    const isOfficer = this.isOfficer();
    const officerExclusiveTabs = [
      'tab-officer-overview',
      'tab-create-account',
      'tab-deposit-withdraw',
      'tab-search-account',
      'tab-all-accounts',
      'tab-officer-txns',
      'tab-graphs'
    ];

    const customerExclusiveTabs = [
      'tab-profile'
    ];

    // Backend Role Check: Block customer from officer tabs
    if (!isOfficer && officerExclusiveTabs.includes(tabId)) {
      this.showToast('Access Denied: Bank Officer privileges required for this service.', 'error');
      this.switchTab('tab-dashboard');
      return;
    }

    // Block officer from customer-only profile tab
    if (isOfficer && customerExclusiveTabs.includes(tabId)) {
      this.switchTab('tab-officer-overview');
      return;
    }

    this.currentTab = tabId;

    // Desktop Tabs
    document.querySelectorAll('.nav-tab').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-target') === tabId);
    });

    // Mobile Bottom Nav
    document.querySelectorAll('.mob-nav-item').forEach(b => {
      const onclickAttr = b.getAttribute('onclick') || '';
      b.classList.toggle('active', onclickAttr.includes(tabId));
    });

    // Panes
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.remove('active');
    });

    const activePane = document.getElementById(tabId);
    if (activePane) {
      activePane.classList.add('active');
    }

    // Role-specific Tab Content Rendering
    if (tabId === 'tab-dashboard') {
      this.renderDashboardData();
    } else if (tabId === 'tab-profile') {
      this.renderCustomerProfile();
    } else if (tabId === 'tab-check-balance') {
      if (this.isCustomer()) {
        const custBalCard = document.getElementById('customerDirectBalanceCard');
        const officerBalForm = document.getElementById('checkBalanceForm');
        if (custBalCard) custBalCard.classList.remove('hidden');
        if (officerBalForm) officerBalForm.classList.add('hidden');
        this.refreshCustomerBalance();
      } else {
        const custBalCard = document.getElementById('customerDirectBalanceCard');
        const officerBalForm = document.getElementById('checkBalanceForm');
        if (custBalCard) custBalCard.classList.add('hidden');
        if (officerBalForm) officerBalForm.classList.remove('hidden');
      }
    } else if (tabId === 'tab-officer-overview') {
      this.renderOfficerOverview();
    } else if (tabId === 'tab-officer-txns') {
      this.renderOfficerTransactions();
    } else if (tabId === 'tab-all-accounts') {
      this.renderAllAccountsTable();
    } else if (tabId === 'tab-history') {
      this.renderTransactionHistory();
    } else if (tabId === 'tab-complaints') {
      this.renderComplaintsList();
    } else if (tabId === 'tab-graphs') {
      setTimeout(() => this.renderAllGraphs(), 60);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // CUSTOMER DASHBOARD (RuPay Card & Stats)
  // ==========================================
  renderDashboardData() {
    const acc = window.bankManager.getActiveAccount();
    if (!acc) return;

    // RuPay Card Balance
    const balDisplay = document.getElementById('accountBalanceDisplay');
    if (balDisplay) {
      balDisplay.innerText = this.isBalanceVisible ? acc.getBalance().toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '••••••••';
    }

    const cardAcc = document.getElementById('cardAccountNumber');
    if (cardAcc) cardAcc.innerText = acc.accountNumber;

    const topName = document.getElementById('topUserName');
    if (topName) topName.innerText = acc.holderName;

    const topType = document.getElementById('topAccountType');
    if (topType) topType.innerText = `${acc.accountType} A/C (${acc.accountNumber})`;

    const statusName = document.getElementById('statusAccName');
    const statusNo = document.getElementById('statusAccNo');
    if (statusName) statusName.innerText = acc.holderName;
    if (statusNo) statusNo.innerText = acc.accountNumber;

    // Credits & Debits Stats (Customer's own transactions only)
    let totalCredits = 0;
    let totalDebits = 0;
    acc.transactions.forEach(t => {
      if (t.type === 'DEPOSIT') totalCredits += t.amount;
      else totalDebits += t.amount;
    });

    const credDisp = document.getElementById('statCreditDisplay');
    const debDisp = document.getElementById('statDebitDisplay');
    if (credDisp) credDisp.innerText = '₹ ' + totalCredits.toLocaleString('en-IN');
    if (debDisp) debDisp.innerText = '₹ ' + totalDebits.toLocaleString('en-IN');

    // Mini Recent Transactions for Customer
    const miniList = document.getElementById('miniTransactionList');
    if (miniList) {
      const recent = acc.transactions.slice(0, 5);
      miniList.innerHTML = '';
      if (recent.length === 0) {
        miniList.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted);">No transactions recorded yet.</div>`;
      } else {
        recent.forEach(t => {
          const isDeposit = t.type === 'DEPOSIT';
          const card = document.createElement('div');
          card.style.display = 'flex';
          card.style.justifyContent = 'space-between';
          card.style.alignItems = 'center';
          card.style.padding = '12px 14px';
          card.style.background = 'var(--bg-secondary)';
          card.style.borderRadius = 'var(--radius-sm)';
          card.style.marginBottom = '8px';
          card.innerHTML = `
            <div>
              <strong style="font-size: 13.5px; display: block;">${t.reference || t.category}</strong>
              <small style="color: var(--text-muted);">${t.getFormattedDate()}</small>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 15px; color: ${isDeposit ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${isDeposit ? '+' : '-'} ₹ ${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <div style="font-size: 11px; color: var(--text-muted);">Bal: ₹ ${t.balanceAfter.toLocaleString('en-IN')}</div>
            </div>
          `;
          miniList.appendChild(card);
        });
      }
    }
  }

  // ==========================================
  // CUSTOMER PROFILE DETAILS RENDERER
  // ==========================================
  renderCustomerProfile() {
    if (!this.isCustomer()) return;
    const profile = window.bankManager.getCustomerProfile();
    if (!profile) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setTxt('profHolderName', profile.holderName);
    setTxt('profAccountType', `${profile.accountType} Account`);
    setTxt('profStatus', profile.status);
    setTxt('profAccountNumber', profile.accountNumber);
    setTxt('profCustomerId', profile.customerId);
    setTxt('profBalance', profile.formattedBalance);
    setTxt('profScheme', `${profile.accountType} Account Scheme (4.00% p.a.)`);
    setTxt('profIfsc', profile.ifscCode);
    setTxt('profMicr', profile.micrCode);
    setTxt('profBranch', profile.branchName);

    setTxt('profFullName', profile.holderName);
    setTxt('profUsername', profile.username);
    setTxt('profPhone', profile.phoneNumber);
    setTxt('profEmail', profile.email);
    setTxt('profOpenDate', profile.createdDate ? new Date(profile.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jan 2024');

    setTxt('profRupayType', profile.rupayCardType);
    setTxt('profCardStatus', profile.rupayStatus === 'ACTIVE' ? 'ACTIVE / CONTACTLESS' : 'BLOCKED');
    setTxt('profUpiId', `${profile.accountNumber}@mahabank`);
  }

  refreshCustomerBalance() {
    const acc = window.bankManager.getActiveAccount();
    if (!acc) return;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setTxt('balCardAmount', acc.getBalance().toLocaleString('en-IN', { minimumFractionDigits: 2 }));
    setTxt('balCardHolder', acc.holderName);
    setTxt('balCardAccNo', acc.accountNumber);
    setTxt('balCardType', `${acc.accountType} Account`);
    setTxt('balCardStatus', acc.status);

    const statusPill = document.getElementById('balCardStatus');
    if (statusPill) {
      statusPill.className = `status-pill ${acc.isActive() ? 'active' : 'deactivated'}`;
    }
    this.showToast('Account balance refreshed.', 'info');
  }

  // ==========================================
  // OFFICER CBS OVERVIEW & AUDIT LEDGER
  // ==========================================
  renderOfficerOverview() {
    if (!this.isOfficer()) return;
    const officer = window.bankManager.getActiveUser();
    let stats;
    try {
      stats = window.bankManager.getBranchStats();
    } catch (e) {
      return;
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    if (officer) {
      setTxt('officerHeroName', officer.fullName);
      setTxt('officerHeroId', officer.officerId);
    }

    setTxt('officerStatDeposits', '₹ ' + stats.totalDeposits.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
    setTxt('officerStatActiveAccs', `${stats.activeCount} Active / ${stats.totalAccounts} Total`);
    setTxt('officerStatRatio', `${stats.savingsCount} Sav / ${stats.currentCount} Cur`);
    setTxt('officerStatComplaints', `${stats.pendingComplaints} Pending`);

    // Mini audit log
    const container = document.getElementById('officerAuditMiniList');
    if (container) {
      const txns = window.bankManager.getAllTransactions().slice(0, 5);
      container.innerHTML = '';
      if (txns.length === 0) {
        container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted);">No CBS transactions recorded yet.</div>`;
      } else {
        txns.forEach(t => {
          const isDeposit = t.type === 'DEPOSIT';
          const card = document.createElement('div');
          card.style.display = 'flex';
          card.style.justifyContent = 'space-between';
          card.style.alignItems = 'center';
          card.style.padding = '12px 14px';
          card.style.background = 'var(--bg-secondary)';
          card.style.borderRadius = 'var(--radius-sm)';
          card.style.marginBottom = '8px';
          card.innerHTML = `
            <div>
              <strong style="font-size: 13.5px; display: block;">${t.reference || t.category} • <span style="font-family: monospace;">A/C ${t.accountNumber}</span> (${t.holderName})</strong>
              <small style="color: var(--text-muted);">${t.getFormattedDate()}</small>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 15px; color: ${isDeposit ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${isDeposit ? '+' : '-'} ₹ ${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
              <div style="font-size: 11px; color: var(--text-muted);">Bal: ₹ ${t.balanceAfter.toLocaleString('en-IN')}</div>
            </div>
          `;
          container.appendChild(card);
        });
      }
    }
  }

  renderOfficerTransactions(filterQuery = '') {
    if (!this.isOfficer()) return;
    const tbody = document.getElementById('officerTxnTableBody');
    if (!tbody) return;

    let txns = [];
    try {
      txns = window.bankManager.getAllTransactions();
    } catch (e) {
      return;
    }

    const q = filterQuery.toLowerCase().trim();
    if (q) {
      txns = txns.filter(t =>
        t.accountNumber.includes(q) ||
        (t.holderName && t.holderName.toLowerCase().includes(q)) ||
        (t.reference && t.reference.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    tbody.innerHTML = '';
    if (txns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No transactions matching query.</td></tr>`;
      return;
    }

    txns.forEach(t => {
      const isDeposit = t.type === 'DEPOSIT';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.getFormattedDate()}</strong></td>
        <td><strong style="font-family: monospace;">${t.accountNumber}</strong></td>
        <td><strong>${t.holderName}</strong></td>
        <td><span class="status-pill ${isDeposit ? 'active' : 'deactivated'}">${t.type} (${t.category})</span></td>
        <td><strong style="color: ${isDeposit ? 'var(--accent-green)' : 'var(--accent-red)'}">${isDeposit ? '+' : '-'} ₹ ${t.amount.toLocaleString('en-IN')}</strong></td>
        <td><strong>₹ ${t.balanceAfter.toLocaleString('en-IN')}</strong></td>
        <td><code style="font-size: 11px; color: var(--brand-blue);">${t.reference}</code></td>
      `;
      tbody.appendChild(tr);
    });
  }

  filterOfficerTransactions(query) {
    this.renderOfficerTransactions(query);
  }

  toggleBalanceVisibility() {
    this.isBalanceVisible = !this.isBalanceVisible;
    const eyeIcon = document.getElementById('eyeIcon');
    if (eyeIcon) {
      eyeIcon.className = this.isBalanceVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }
    this.renderDashboardData();
  }

  // ==========================================
  // CREATE ACCOUNT (Officer Only)
  // ==========================================
  async handleCreateAccountSubmit(event) {
    if (event) event.preventDefault();
    if (!this.isOfficer()) {
      this.showToast('Access Denied: Bank Officer privileges required to open accounts here.', 'error');
      return;
    }

    const name = document.getElementById('holderNameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const phone = document.getElementById('phoneInput').value.trim();
    const type = document.getElementById('accountTypeSelect').value;
    const deposit = Number(document.getElementById('openingDepositInput').value);

    if (phone.length !== 10 || isNaN(Number(phone))) {
      this.showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    try {
      const cleanUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
      const newAcc = await window.bankManager.createAccountByOfficer({
        holderName: name,
        username: cleanUsername,
        email,
        phoneNumber: phone,
        accountType: type,
        openingDeposit: deposit,
        password: 'Password@123'
      });

      const resBox = document.getElementById('createAccountResultBox');
      if (resBox) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="res-header success">
            <i class="fa-solid fa-circle-check"></i> Customer Account Created Successfully!
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px;">
            <div>Account Number: <strong style="font-family: monospace; font-size: 16px; color: var(--brand-blue);">${newAcc.accountNumber}</strong></div>
            <div>Account Holder: <strong>${newAcc.holderName}</strong> (${newAcc.accountType} A/C)</div>
            <div>Generated Username: <strong style="font-family: monospace;">${newAcc.username}</strong></div>
            <div>Temporary Password: <code>Password@123</code></div>
            <div>Opening Deposit: <strong class="text-green">${newAcc.getFormattedBalance()}</strong></div>
          </div>
          <div style="margin-top: 12px; display: flex; gap: 10px;">
            <button class="primary-btn" onclick="appUI.quickCheckBalance('${newAcc.accountNumber}')">Inquire Balance</button>
            <button class="secondary-btn" onclick="appUI.switchTab('tab-all-accounts')">View in CBS Directory</button>
          </div>
        `;
      }

      this.showToast(`Account ${newAcc.accountNumber} created for ${newAcc.holderName}!`, 'success');
      document.getElementById('createAccountForm').reset();
      this.renderOfficerOverview();
      this.renderAllAccountsTable();
      if (window.voiceBot) window.voiceBot.playChime('success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // DEPOSIT & WITHDRAW (Officer Only Operation)
  // ==========================================
  handleDeposit() {
    if (!this.isOfficer()) {
      this.showToast('Access Denied: Cash deposits must be processed by a Bank Officer.', 'error');
      return;
    }

    const accNo = document.getElementById('dwAccountNoInput').value.trim();
    const amount = Number(document.getElementById('dwAmountInput').value);

    if (!accNo || accNo.length !== 10) {
      this.showToast('Please enter a valid 10-digit account number.', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      this.showToast('Please enter a valid deposit amount.', 'error');
      return;
    }

    try {
      const res = window.bankManager.deposit(accNo, amount, 'Cash Deposit at Teller Counter', 'CASH');
      const acc = res.account;

      const resBox = document.getElementById('dwResultBox');
      if (resBox) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="res-header success">
            <i class="fa-solid fa-circle-check"></i> Deposit Successful!
          </div>
          <div style="font-size: 13.5px;">
            <div>A/C Holder: <strong>${acc.holderName}</strong> (A/C: ${acc.accountNumber})</div>
            <div>Deposited: <strong class="text-green">+ ₹ ${amount.toLocaleString('en-IN')}</strong></div>
            <div style="margin-top: 6px; font-size: 16px;">New Ledger Balance: <strong class="text-green">${acc.getFormattedBalance()}</strong></div>
          </div>
        `;
      }

      this.showToast(`₹ ${amount.toLocaleString('en-IN')} deposited to account ${accNo}.`, 'success');
      document.getElementById('dwAmountInput').value = '';
      this.renderOfficerOverview();
      this.renderAllAccountsTable();
      if (window.voiceBot) window.voiceBot.playChime('success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  handleWithdraw() {
    if (!this.isOfficer()) {
      this.showToast('Access Denied: Cash withdrawals must be processed by a Bank Officer.', 'error');
      return;
    }

    const accNo = document.getElementById('dwAccountNoInput').value.trim();
    const amount = Number(document.getElementById('dwAmountInput').value);

    if (!accNo || accNo.length !== 10) {
      this.showToast('Please enter a valid 10-digit account number.', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      this.showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    try {
      const res = window.bankManager.withdraw(accNo, amount, 'Cash Withdrawal at Teller Counter', 'CASH');
      const acc = res.account;

      const resBox = document.getElementById('dwResultBox');
      if (resBox) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="res-header success">
            <i class="fa-solid fa-circle-check"></i> Withdrawal Successful!
          </div>
          <div style="font-size: 13.5px;">
            <div>A/C Holder: <strong>${acc.holderName}</strong> (A/C: ${acc.accountNumber})</div>
            <div>Withdrawn: <strong class="text-red">- ₹ ${amount.toLocaleString('en-IN')}</strong></div>
            <div style="margin-top: 6px; font-size: 16px;">Remaining Balance: <strong style="color: var(--brand-navy);">${acc.getFormattedBalance()}</strong></div>
          </div>
        `;
      }

      this.showToast(`₹ ${amount.toLocaleString('en-IN')} withdrawn from account ${accNo}.`, 'success');
      document.getElementById('dwAmountInput').value = '';
      this.renderOfficerOverview();
      this.renderAllAccountsTable();
      if (window.voiceBot) window.voiceBot.playChime('success');
    } catch (err) {
      const resBox = document.getElementById('dwResultBox');
      if (resBox) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `
          <div class="res-header error"><i class="fa-solid fa-circle-xmark"></i> Withdrawal Denied</div>
          <p style="font-size: 13px; color: var(--accent-red);">${err.message}</p>
        `;
      }
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // CHECK BALANCE
  // ==========================================
  handleCheckBalance(event) {
    if (event) event.preventDefault();

    const accNo = document.getElementById('checkBalAccInput').value.trim();
    if (!accNo || accNo.length !== 10) {
      this.showToast('Please enter a valid 10-digit account number.', 'error');
      return;
    }

    const acc = window.bankManager.findAccount(accNo);
    const resBox = document.getElementById('checkBalanceResultBox');
    if (!resBox) return;

    if (!acc) {
      resBox.classList.remove('hidden');
      resBox.innerHTML = `
        <div class="res-header error"><i class="fa-solid fa-circle-xmark"></i> Account Not Found</div>
        <p style="font-size: 13px; color: var(--text-muted);">No account found with number <strong>${accNo}</strong>.</p>
      `;
      this.showToast('Account not found.', 'error');
      return;
    }

    resBox.classList.remove('hidden');
    resBox.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div>Account Holder: <strong style="font-size: 16px;">${acc.holderName}</strong></div>
        <div style="font-size: 13px; color: var(--text-muted);">
          Account No: <strong style="font-family: monospace;">${acc.accountNumber}</strong> | Type: <strong>${acc.accountType}</strong> | Status: <strong class="${acc.isActive() ? 'text-green' : 'text-red'}">${acc.status}</strong>
        </div>
        <div style="margin-top: 8px;">
          <span style="font-size: 12px; color: var(--text-muted);">Available Ledger Balance:</span>
          <div style="font-size: 26px; font-weight: 800; color: var(--brand-navy);">${acc.getFormattedBalance()}</div>
        </div>
      </div>
    `;

    if (window.voiceBot) {
      window.voiceBot.speakMarathi(`${acc.holderName} जी, खात्यात ${acc.getBalance()} रुपये शिल्लक आहेत.`);
    }
  }

  quickCheckBalance(accountNumber) {
    this.switchTab('tab-check-balance');
    const input = document.getElementById('checkBalAccInput');
    if (input) {
      input.value = accountNumber;
      this.handleCheckBalance();
    }
  }

  // ==========================================
  // SEARCH ACCOUNT (Officer Only)
  // ==========================================
  handleSearchAccount(event) {
    if (event) event.preventDefault();
    if (!this.isOfficer()) {
      this.showToast('Access Denied: Only bank officers can search the central customer database.', 'error');
      return;
    }

    const query = document.getElementById('searchQueryInput').value.trim();
    const tbody = document.getElementById('searchResultsTableBody');
    if (!tbody) return;

    try {
      const matched = window.bankManager.searchAccounts(query);
      tbody.innerHTML = '';

      if (matched.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-muted);">No account found matching "${query}".</td></tr>`;
        return;
      }

      matched.forEach(acc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="font-family: monospace;">${acc.accountNumber}</strong></td>
          <td><strong>${acc.holderName}</strong></td>
          <td><span class="status-pill active">${acc.accountType}</span></td>
          <td>${acc.phoneNumber}</td>
          <td><strong style="color: var(--brand-navy);">${acc.getFormattedBalance()}</strong></td>
          <td>
            <button class="tool-btn" onclick="appUI.quickCheckBalance('${acc.accountNumber}')">Inquire</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // FUND TRANSFER (Customer Only)
  // ==========================================
  handleTransferSubmit(event) {
    event.preventDefault();
    if (!this.isCustomer()) {
      this.showToast('Please login as a Customer to initiate online fund transfers.', 'error');
      return;
    }

    const recipient = document.getElementById('transferRecipient').value.trim();
    const amount = Number(document.getElementById('transferAmount').value);
    const pin = document.getElementById('transferPin').value.trim();
    const mode = document.querySelector('input[name="trMode"]:checked').value;

    try {
      window.bankManager.customerTransfer({
        recipient,
        amount,
        pin,
        mode,
        remarks: `${mode} transfer to ${recipient}`
      });

      this.showToast(`Transfer of ₹ ${amount.toLocaleString('en-IN')} to ${recipient} completed!`, 'success');
      document.getElementById('fundTransferForm').reset();
      this.renderDashboardData();
      this.refreshCustomerBalance();
      if (window.voiceBot) window.voiceBot.playChime('success');
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // TRANSACTION HISTORY PASSBOOK
  // ==========================================
  renderTransactionHistory() {
    const tbody = document.getElementById('transactionHistoryTableBody');
    if (!tbody) return;

    let txns = [];
    if (this.isCustomer()) {
      txns = window.bankManager.customerGetTransactions().slice().reverse();
    } else {
      txns = window.bankManager.getAllTransactions();
    }

    tbody.innerHTML = '';
    if (txns.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No transactions recorded for this account.</td></tr>`;
      return;
    }

    txns.forEach(t => {
      const isDeposit = t.type === 'DEPOSIT';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.getFormattedDate()}</strong></td>
        <td><span style="font-family: monospace;">${t.accountNumber}</span></td>
        <td><strong>${t.holderName}</strong></td>
        <td><span class="status-pill ${isDeposit ? 'active' : 'deactivated'}">${t.type} (${t.category})</span></td>
        <td><strong style="color: ${isDeposit ? 'var(--accent-green)' : 'var(--accent-red)'}">${isDeposit ? '+' : '-'} ₹ ${t.amount.toLocaleString('en-IN')}</strong></td>
        <td><strong>₹ ${t.balanceAfter.toLocaleString('en-IN')}</strong></td>
        <td><code style="font-size: 11px; color: var(--brand-blue);">${t.reference}</code></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================
  // COMPUTER GRAPHICS (Canvas 2D Engine)
  // ==========================================
  renderAllGraphs() {
    const accounts = window.bankManager.accounts;
    if (window.ComputerGraphicsEngine) {
      window.ComputerGraphicsEngine.drawBarChart('barChartCanvas', accounts);
      window.ComputerGraphicsEngine.drawPieChart('pieChartCanvas', accounts);
    }
  }

  // ==========================================
  // ALL ACCOUNTS TABLE & STATUS TOGGLE (Officer Only)
  // ==========================================
  renderAllAccountsTable() {
    const tbody = document.getElementById('allAccountsTableBody');
    if (!tbody) return;

    let accounts = [];
    try {
      accounts = window.bankManager.getAllAccounts();
    } catch (e) {
      return;
    }

    tbody.innerHTML = '';

    accounts.forEach(acc => {
      const isActive = acc.isActive();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="font-family: monospace;">${acc.accountNumber}</strong></td>
        <td><strong>${acc.holderName}</strong></td>
        <td>${acc.email}</td>
        <td>${acc.phoneNumber}</td>
        <td><span class="status-pill active">${acc.accountType}</span></td>
        <td><strong style="color: var(--brand-navy);">${acc.getFormattedBalance()}</strong></td>
        <td>
          <span class="status-pill ${isActive ? 'active' : 'deactivated'}">${acc.status}</span>
        </td>
        <td>
          <button class="secondary-btn" style="padding: 4px 10px; font-size: 11px;" onclick="appUI.toggleAccountStatus('${acc.accountNumber}')">
            ${isActive ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  toggleAccountStatus(accountNumber) {
    if (!this.isOfficer()) {
      this.showToast('Access Denied: Officer authorization required to change account status.', 'error');
      return;
    }
    try {
      const acc = window.bankManager.toggleAccountStatus(accountNumber);
      this.showToast(`Account ${accountNumber} status set to ${acc.status}.`, 'info');
      this.renderAllAccountsTable();
      this.renderOfficerOverview();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // COMPLAINTS & HELPDESK
  // ==========================================
  handleLodgeComplaint(event) {
    event.preventDefault();
    const subject = document.getElementById('cmpSubject').value.trim();
    const desc = document.getElementById('cmpDesc').value.trim();

    try {
      if (this.isCustomer()) {
        const cmp = window.bankManager.customerFileComplaint({ category: 'GENERAL', subject, description: desc });
        this.showToast(`Complaint lodged! Ticket #${cmp.id}`, 'success');
      } else {
        const officer = window.bankManager.getActiveUser();
        const cmp = window.bankManager.fileComplaint({
          accountNumber: 'BRANCH-OFFICER',
          customerName: officer ? officer.fullName : 'Bank Officer',
          category: 'BRANCH',
          subject,
          description: desc
        });
        this.showToast(`Branch incident ticket #${cmp.id} logged.`, 'success');
      }
      document.getElementById('lodgeComplaintForm').reset();
      this.renderComplaintsList();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  renderComplaintsList() {
    const container = document.getElementById('complaintsListContainer');
    if (!container) return;

    container.innerHTML = '';
    const isOfficer = this.isOfficer();
    let complaints = [];

    if (isOfficer) {
      complaints = window.bankManager.complaints;
    } else {
      complaints = window.bankManager.customerGetComplaints();
    }

    if (complaints.length === 0) {
      container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 12.5px;">No complaints recorded.</div>`;
      return;
    }

    complaints.forEach(c => {
      const div = document.createElement('div');
      div.style.padding = '12px 14px';
      div.style.background = 'var(--bg-secondary)';
      div.style.borderRadius = 'var(--radius-sm)';
      div.style.marginBottom = '10px';
      const isPending = c.status === 'PENDING';

      div.innerHTML = `
        <div class="flex-between">
          <strong style="font-size: 13px;">${c.id} • ${c.subject}</strong>
          <span class="status-pill ${isPending ? 'deactivated' : 'active'}">${c.status}</span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); margin: 6px 0;">${c.description}</p>
        <div class="flex-between" style="font-size: 11px; color: var(--text-muted);">
          <span>Customer: <strong>${c.customerName}</strong> (${c.accountNumber}) • ${c.getFormattedDate()}</span>
          ${isOfficer && isPending ? `<button class="primary-btn" style="padding: 2px 10px; font-size: 11px;" onclick="appUI.handleResolveComplaint('${c.id}')"><i class="fa-solid fa-check"></i> Resolve</button>` : ''}
        </div>
        ${c.resolution ? `<div style="margin-top: 6px; font-size: 11px; color: var(--accent-green);"><strong>Resolution:</strong> ${c.resolution}</div>` : ''}
      `;
      container.appendChild(div);
    });
  }

  handleResolveComplaint(complaintId) {
    if (!this.isOfficer()) return;
    try {
      window.bankManager.resolveComplaint(complaintId, 'Grievance resolved and verified by MahaBank Branch Officer.');
      this.showToast(`Complaint #${complaintId} marked resolved.`, 'success');
      this.renderComplaintsList();
      this.renderOfficerOverview();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // GLOBAL SEARCH & THEME & LANGUAGE
  // ==========================================
  handleGlobalSearch(query) {
    const q = query.toLowerCase().trim();
    const dd = document.getElementById('searchDropdown');
    if (!dd) return;

    if (!q) {
      dd.classList.remove('active');
      return;
    }

    const isOfficer = this.isOfficer();
    const customerItems = [
      { name: 'Overview & RuPay Card', tab: 'tab-dashboard' },
      { name: 'My Account Details & Profile', tab: 'tab-profile' },
      { name: 'Check My Balance', tab: 'tab-check-balance' },
      { name: 'My Transaction History', tab: 'tab-history' },
      { name: 'Fund Transfer (UPI)', tab: 'tab-transfer' },
      { name: 'Complaints & Helpdesk', tab: 'tab-complaints' }
    ];

    const officerItems = [
      { name: 'Officer CBS Overview', tab: 'tab-officer-overview' },
      { name: 'Create Account', tab: 'tab-create-account' },
      { name: 'Deposit / Withdraw Cash', tab: 'tab-deposit-withdraw' },
      { name: 'Search CBS Accounts', tab: 'tab-search-account' },
      { name: 'Customer Account Management', tab: 'tab-all-accounts' },
      { name: 'Master Transaction Ledger', tab: 'tab-officer-txns' },
      { name: 'Graphs (Computer Graphics)', tab: 'tab-graphs' },
      { name: 'Complaints & Helpdesk', tab: 'tab-complaints' }
    ];

    const items = isOfficer ? officerItems : customerItems;
    const matched = items.filter(i => i.name.toLowerCase().includes(q));
    dd.innerHTML = '';
    matched.forEach(item => {
      const div = document.createElement('div');
      div.className = 'search-item';
      div.innerText = item.name;
      div.onclick = () => {
        this.switchTab(item.tab);
        dd.classList.remove('active');
        document.getElementById('globalSearchInput').value = '';
      };
      dd.appendChild(div);
    });

    dd.classList.add('active');
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('mahabank_theme', this.currentTheme);
    this.showToast(this.currentTheme === 'dark' ? 'Dark Mode Enabled' : 'Bright Mode Enabled', 'info');
    if (this.currentTab === 'tab-graphs') setTimeout(() => this.renderAllGraphs(), 60);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    ['themeIcon', 'authThemeIcon'].forEach(id => {
      const icon = document.getElementById(id);
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        icon.style.color = theme === 'dark' ? '#fbbf24' : '';
      }
    });
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'en' ? 'mr' : 'en';
    localStorage.setItem('mahabank_lang', this.currentLang);
    this.applyLanguage(this.currentLang);
    this.showToast(this.currentLang === 'en' ? 'Language set to English' : 'भाषा मराठी निवडली आहे', 'info');
  }

  applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    ['langLabel', 'authLangLabel'].forEach(id => {
      const label = document.getElementById(id);
      if (label) label.innerText = lang === 'en' ? 'English' : 'मराठी';
    });

    const dict = this.translations[lang] || this.translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.innerText = dict[key];
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => {
        if (typeof toast.remove === 'function') {
          toast.remove();
        } else if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 3200);
  }
}

// Global UI Controller Instance
window.appUI = new BankAppUI();

document.addEventListener('DOMContentLoaded', () => {
  window.appUI.init();
});
