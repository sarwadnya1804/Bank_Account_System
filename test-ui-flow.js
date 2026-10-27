/**
 * Frontend UI & Navigation Simulation Test
 * Validates DOM interaction, role filtering, tab navigation,
 * and page reload simulation.
 */

const fs = require('fs');
const assert = require('assert');

// Simple DOM element mock
class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.value = '';
    this.innerText = '';
    this.innerHTML = '';
    this.className = '';
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classList._classes.has(c)) this.classList._classes.delete(c);
          else this.classList._classes.add(c);
        } else if (force) {
          this.classList._classes.add(c);
        } else {
          this.classList._classes.delete(c);
        }
      },
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {};
    this.attributes = {};
    this._listeners = {};
    this.children = [];
  }
  getAttribute(name) {
    return this.attributes[name] || null;
  }
  setAttribute(name, val) {
    this.attributes[name] = val;
  }
  appendChild(child) {
    this.children.push(child);
  }
  addEventListener(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }
  focus() {}
  reset() {
    this.value = '';
  }
}

class MockStorage {
  constructor() { this.data = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.data, k) ? this.data[k] : null; }
  setItem(k, v) { this.data[k] = String(v); }
  removeItem(k) { delete this.data[k]; }
  clear() { this.data = {}; }
}

global.window = global;
global.addEventListener = () => {};
global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();

const elements = {};
function getOrCreateElem(id, tagName = 'div') {
  if (!elements[id]) {
    elements[id] = new MockElement(id, tagName);
  }
  return elements[id];
}

global.document = {
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => null
  },
  getElementById: (id) => getOrCreateElem(id),
  querySelector: (sel) => {
    if (sel.includes('.user-avatar')) return getOrCreateElem('userAvatarMock');
    return getOrCreateElem('queryMock');
  },
  querySelectorAll: (sel) => {
    if (sel === '.nav-tab') {
      return [
        getOrCreateElem('tabBtnDashboard'),
        getOrCreateElem('tabBtnProfile'),
        getOrCreateElem('tabBtnCheckBal'),
        getOrCreateElem('tabBtnOfficerOverview'),
        getOrCreateElem('tabBtnCreateAcc'),
        getOrCreateElem('tabBtnDepWd')
      ];
    }
    if (sel === '.role-customer') {
      const b1 = getOrCreateElem('roleCust1');
      const b2 = getOrCreateElem('roleCust2');
      return [b1, b2];
    }
    if (sel === '.role-officer') {
      const b1 = getOrCreateElem('roleOff1');
      const b2 = getOrCreateElem('roleOff2');
      return [b1, b2];
    }
    if (sel === '.mob-nav-item') return [];
    if (sel === '.tab-pane') return [getOrCreateElem('tab-dashboard'), getOrCreateElem('tab-officer-overview')];
    if (sel === '[data-i18n]') return [];
    return [];
  },
  createElement: (tag) => new MockElement('dyn_' + Math.random(), tag),
  addEventListener: () => {}
};
global.scrollTo = () => {};

// Load engine and app
require('./oop-engine.js');
require('./app.js');

(async () => {
  console.log('====================================================');
  console.log('UI & ROUTING INTEGRATION TESTS');
  console.log('====================================================');

  const ui = window.appUI;

  // 1. Fresh start: No session -> Auth view
  sessionStorage.clear();
  ui.init();
  assert(getOrCreateElem('authPortal').classList.contains('hidden') === false, 'Auth portal should be visible');
  assert(getOrCreateElem('mainAppContainer').classList.contains('hidden') === true, 'Main app should be hidden');
  console.log('[PASS] 1. Initial State: Website displays Login Portal without unauthenticated session');

  // 2. Customer Login
  getOrCreateElem('customerLoginIdentifier').value = 'amit';
  getOrCreateElem('customerLoginPassword').value = 'Password@123';

  await ui.handleCustomerLoginSubmit({ preventDefault: () => {} });

  assert(getOrCreateElem('authPortal').classList.contains('hidden') === true, 'Auth portal should be hidden after login');
  assert(getOrCreateElem('mainAppContainer').classList.contains('hidden') === false, 'Main app should be visible after login');
  assert.strictEqual(ui.isCustomer(), true);
  assert.strictEqual(ui.isOfficer(), false);

  // Check role-based navigation display
  const custItems = document.querySelectorAll('.role-customer');
  const officerItems = document.querySelectorAll('.role-officer');
  assert.strictEqual(custItems[0].style.display, '', 'Customer nav elements should be visible');
  assert.strictEqual(officerItems[0].style.display, 'none', 'Officer nav elements should be hidden for Customer');
  console.log('[PASS] 2. Customer Login: Shows Customer Dashboard and hides Officer features');

  // 3. Security Route Guard: Customer trying to switch to officer tab
  ui.switchTab('tab-deposit-withdraw');
  assert.strictEqual(ui.currentTab, 'tab-dashboard', 'Customer must be blocked from switching to tab-deposit-withdraw');

  ui.switchTab('tab-create-account');
  assert.strictEqual(ui.currentTab, 'tab-dashboard', 'Customer must be blocked from switching to tab-create-account');

  ui.switchTab('tab-officer-overview');
  assert.strictEqual(ui.currentTab, 'tab-dashboard', 'Customer must be blocked from switching to tab-officer-overview');
  console.log('[PASS] 3. Route Guard: Blocked Customer from accessing Officer tabs via UI/URL');

  // 4. Logout
  ui.handleLogout();
  assert.strictEqual(sessionStorage.getItem('mahabank_session'), null, 'Session must be removed from sessionStorage');
  assert(getOrCreateElem('authPortal').classList.contains('hidden') === false, 'Auth portal must be shown on logout');
  assert(getOrCreateElem('mainAppContainer').classList.contains('hidden') === true, 'Main app must be hidden on logout');
  console.log('[PASS] 4. Logout: Session terminated and returned to Login page');

  // 5. Officer Login
  getOrCreateElem('officerLoginIdentifier').value = 'officer';
  getOrCreateElem('officerLoginPassword').value = 'Password@123';

  await ui.handleOfficerLoginSubmit({ preventDefault: () => {} });

  assert.strictEqual(ui.isOfficer(), true);
  assert.strictEqual(ui.isCustomer(), false);
  assert.strictEqual(custItems[0].style.display, 'none', 'Customer nav elements should be hidden for Officer');
  assert.strictEqual(officerItems[0].style.display, '', 'Officer nav elements should be visible for Officer');

  // Officer switching to officer tabs works
  ui.switchTab('tab-officer-overview');
  assert.strictEqual(ui.currentTab, 'tab-officer-overview');

  ui.switchTab('tab-create-account');
  assert.strictEqual(ui.currentTab, 'tab-create-account');

  ui.switchTab('tab-deposit-withdraw');
  assert.strictEqual(ui.currentTab, 'tab-deposit-withdraw');
  console.log('[PASS] 5. Officer Login: Shows Officer CBS Dashboard with full teller & management controls');

  // 6. Reload Simulation with Active Officer Session
  ui.init();
  assert.strictEqual(ui.isOfficer(), true, 'Officer session should be restored on reload');
  assert(getOrCreateElem('mainAppContainer').classList.contains('hidden') === false, 'Main app remains visible on reload');
  console.log('[PASS] 6. Reload Persistence: Officer session restored on page refresh');

  console.log('====================================================');
  console.log('ALL UI & ROUTING TESTS PASSED (6/6)');
  console.log('====================================================');
  process.exit(0);
})();
