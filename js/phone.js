// js/phone.js — phone shell renderer, app navigation, dual-mode layout, keyboard handling

const APPS = [
  { id: 'messages', label: '信息', icon: '💬', gradient: 'linear-gradient(135deg, #34c759, #28a745)' },
  { id: 'browser', label: '浏览器', icon: '🌐', gradient: 'linear-gradient(135deg, #007aff, #0056d6)' },
  { id: 'radio', label: '电台', icon: '📻', gradient: 'linear-gradient(135deg, #ff3b30, #c62828)' },
  { id: 'phone', label: '电话', icon: '📞', gradient: 'linear-gradient(135deg, #34c759, #1b8e3a)' },
  { id: 'gallery', label: '相册', icon: '🖼️', gradient: 'linear-gradient(135deg, #ff9500, #e65100)' },
  { id: 'notes', label: '备忘录', icon: '📝', gradient: 'linear-gradient(135deg, #ffcc00, #f9a825)' },
  { id: 'mail', label: '邮件', icon: '✉️', gradient: 'linear-gradient(135deg, #007aff, #0044aa)' },
];

const DOCK_APPS = ['messages', 'radio', 'browser', 'phone'];

function hasUnreadMessages() {
  return MESSAGE_DATA.contacts.some(c => {
    const nonMeMsgs = c.messages.filter(m => m.phase <= GameState.gamePhase && m.from !== 'me');
    if (nonMeMsgs.length === 0) return false;
    const seen = typeof GameState.readChats[c.id] === 'number'
      ? GameState.readChats[c.id]
      : (GameState.readChats[c.id] ? nonMeMsgs.length : 0);
    return nonMeMsgs.length > seen;
  });
}
const PHONE_W = 320;
const PHONE_H = 680;

// ---- Mobile detection ----
function isMobileGameDevice() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const uaDataMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk|Kindle|PlayBook/i.test(ua);
  const iPadDesktopUA = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const coarseTouchOnly = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(hover: hover)').matches);
  return uaDataMobile || mobileUA || iPadDesktopUA || coarseTouchOnly;
}

function syncDeviceMode() {
  const isMobile = isMobileGameDevice();
  document.body.classList.toggle('device-mobile', isMobile);
  document.body.classList.toggle('device-desktop', !isMobile);
  return isMobile;
}

// ---- Layout ----
let _baseMobileViewportHeight = 0;

function getKeyboardHeight() {
  if (!window.visualViewport) return 0;
  return Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
}

function applyPhoneLayout() {
  const container = document.querySelector('.phone-container');
  const frame = document.querySelector('.phone-frame');
  if (!container || !frame) return;

  const isMobile = syncDeviceMode();
  const viewportHeight = window.innerHeight;
  const keyboardHeight = getKeyboardHeight();

  if (isMobile) {
    // Lock base height on first layout or when keyboard is dismissed
    if (!_baseMobileViewportHeight || keyboardHeight <= 120) {
      _baseMobileViewportHeight = viewportHeight;
    }

    const scale = Math.max(0.7, window.innerWidth / PHONE_W);
    frame.style.setProperty('--shell-scale', String(scale));

    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100vw';
    container.style.height = `${_baseMobileViewportHeight}px`;
    container.style.transform = 'none';
    container.style.transformOrigin = 'top left';
    container.style.zIndex = '1';

    frame.style.position = 'relative';
    frame.style.top = '0';
    frame.style.left = '0';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.transform = 'none';
    frame.style.transformOrigin = 'top left';
  } else {
    // Desktop: scale to fit viewport
    const gap = (window.innerWidth <= 360 || viewportHeight <= 620) ? 8 : (window.innerWidth <= 480 ? 12 : 24);
    const scale = Math.max(0.1, Math.min(
      (window.innerWidth - gap) / PHONE_W,
      (viewportHeight - gap) / PHONE_H
    ));
    const offset = window.visualViewport ? window.visualViewport.offsetTop : 0;

    container.style.position = 'fixed';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.width = `${PHONE_W}px`;
    container.style.height = `${PHONE_H}px`;
    container.style.transform = `translate(-50%, calc(-50% + ${offset}px)) scale(${scale})`;
    container.style.transformOrigin = 'center center';
    container.style.zIndex = '1';

    frame.style.position = 'relative';
    frame.style.top = '0';
    frame.style.left = '0';
    frame.style.width = '100%';
    frame.style.height = '100%';
    frame.style.transform = 'none';
    frame.style.transformOrigin = 'center center';
  }
}

// ---- Keyboard floating anchor ----
let _activeMobileInput = null;
let _activeInputStyle = '';
let _activeAnchor = null;
let _activeAnchorStyle = '';
let _keyboardBound = false;
const FLOATING_KEYBOARD_MARGIN = 12;

function isKeyboardEligible(el) {
  return el && el.matches('input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]):not([type="color"]):not([type="file"]), textarea, select');
}

function getKeyboardAnchor(el) {
  return el && el.closest('.keyboard-anchor') ? el.closest('.keyboard-anchor') : el;
}

function clearKeyboardAnchor(preserveActive) {
  if (_activeAnchor) {
    _activeAnchor.style.cssText = _activeAnchorStyle;
    _activeAnchor.classList.remove('keyboard-floating-anchor');
  }
  if (!preserveActive) {
    _activeMobileInput = null;
    _activeInputStyle = '';
    _activeAnchor = null;
    _activeAnchorStyle = '';
  }
}

function updateKeyboardAnchor() {
  if (!isMobileGameDevice() || !_activeMobileInput || !_activeAnchor || !window.visualViewport) return;

  const keyboardHeight = getKeyboardHeight();
  if (keyboardHeight <= 120) {
    clearKeyboardAnchor(true);
    return;
  }

  const rect = _activeAnchor.getBoundingClientRect();
  const visibleBottom = window.visualViewport.height - FLOATING_KEYBOARD_MARGIN;
  if (rect.bottom <= visibleBottom) {
    clearKeyboardAnchor(true);
    return;
  }

  const width = Math.min(Math.max(rect.width, 220), window.innerWidth - (FLOATING_KEYBOARD_MARGIN * 2));
  const left = Math.min(
    Math.max(FLOATING_KEYBOARD_MARGIN, rect.left),
    window.innerWidth - width - FLOATING_KEYBOARD_MARGIN
  );

  _activeAnchor.classList.add('keyboard-floating-anchor');
  _activeAnchor.style.position = 'fixed';
  _activeAnchor.style.left = `${left}px`;
  _activeAnchor.style.right = 'auto';
  _activeAnchor.style.bottom = `${keyboardHeight + FLOATING_KEYBOARD_MARGIN}px`;
  _activeAnchor.style.top = 'auto';
  _activeAnchor.style.width = `${width}px`;
  _activeAnchor.style.maxWidth = `calc(100vw - ${FLOATING_KEYBOARD_MARGIN * 2}px)`;
  _activeAnchor.style.margin = '0';
  _activeAnchor.style.zIndex = '3000';
  _activeAnchor.style.transform = 'none';
}

function bindKeyboardHandling() {
  if (_keyboardBound) return;
  _keyboardBound = true;

  document.addEventListener('focusin', (event) => {
    if (!isMobileGameDevice() || !isKeyboardEligible(event.target)) return;
    clearKeyboardAnchor(false);
    _activeMobileInput = event.target;
    _activeInputStyle = _activeMobileInput.style.cssText;
    _activeAnchor = getKeyboardAnchor(_activeMobileInput);
    _activeAnchorStyle = _activeAnchor.style.cssText;
    setTimeout(updateKeyboardAnchor, 220);
  }, true);

  document.addEventListener('focusout', (event) => {
    if (!_activeMobileInput || event.target !== _activeMobileInput) return;
    setTimeout(() => clearKeyboardAnchor(false), 120);
  }, true);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateKeyboardAnchor);
    window.visualViewport.addEventListener('scroll', updateKeyboardAnchor);
  }

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      _baseMobileViewportHeight = 0;
      applyPhoneLayout();
    }, 120);
  });
}

// ---- Render ----
function renderPhoneShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="phone-container">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="status-bar">
            <div class="status-left">
              <span class="status-time">23:47</span>
            </div>
            <div class="status-right">
              <span id="bgMusicToggle" onclick="toggleBgMusicIcon()" style="cursor:pointer;user-select:none;">🎵</span>
              <span>🌙</span>
            </div>
          </div>
          <div id="screenContent"></div>
        </div>
      </div>
    </div>
  `;
  bindKeyboardHandling();
  applyPhoneLayout();
  renderHomeScreen();
}

function renderHomeScreen() {
  GameState.currentApp = null;
  const screen = document.getElementById('screenContent');
  screen.classList.add('home-active');

  let appIconsHtml = '';
  APPS.forEach(a => {
    if (DOCK_APPS.includes(a.id)) return;
    appIconsHtml += `
      <div class="app-icon" onclick="openApp('${a.id}')">
        <div class="app-icon-inner" style="background: ${a.gradient}">${a.icon}</div>
        <span class="app-label">${a.label}</span>
      </div>
    `;
  });

  let dockHtml = '';
  DOCK_APPS.forEach(id => {
    const a = APPS.find(x => x.id === id);
    const badgeHtml = (id === 'messages' && hasUnreadMessages()) ? '<span class="badge">1</span>' : '';
    dockHtml += `
      <div class="app-icon" onclick="openApp('${a.id}')">
        <div class="app-icon-inner" style="background: ${a.gradient}">
          ${a.icon}
          ${badgeHtml}
        </div>
        <span class="app-label">${a.label}</span>
      </div>
    `;
  });

  screen.innerHTML = `
    <div class="home-screen">
      <div class="home-header">
        <span class="home-header-text">姐姐的手机</span>
        <span id="homeTimeDisplay" style="color:rgba(255,255,255,0.3);font-size:11px;">${getGameTimeString()}</span>
      </div>
      <div class="app-grid">
        ${appIconsHtml}
      </div>
      <div class="dock">
        ${dockHtml}
      </div>
      <div class="home-indicator"></div>
    </div>
  `;
}

function renderAppView(appId) {
  const renderers = {
    messages: typeof renderMessagesApp === 'function' ? renderMessagesApp : () => genericAppView('信息'),
    browser: typeof renderBrowserApp === 'function' ? renderBrowserApp : () => genericAppView('浏览器'),
    radio: typeof renderRadioApp === 'function' ? renderRadioApp : () => genericAppView('电台'),
    phone: typeof renderPhoneApp === 'function' ? renderPhoneApp : () => genericAppView('电话'),
    gallery: typeof renderGalleryApp === 'function' ? renderGalleryApp : () => genericAppView('相册'),
    notes: typeof renderNotesApp === 'function' ? renderNotesApp : () => genericAppView('备忘录'),
    mail: typeof renderMailApp === 'function' ? renderMailApp : () => genericAppView('邮件'),
  };
  const render = renderers[appId] || renderHomeScreen;
  render();
}

function genericAppView(title) {
  const screen = document.getElementById('screenContent');
  screen.innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">${title}</span>
      </div>
      <div class="app-content">
        <p style="color: rgba(255,255,255,0.4); text-align: center; margin-top: 40px;">
          即将到来...
        </p>
      </div>
    </div>
  `;
}

function openApp(appId) {
  stopAllRadioAudio();
  const screen = document.getElementById('screenContent');
  if (screen) screen.classList.remove('home-active');
  GameState.currentApp = appId;
  GameState.save();
  renderAppView(appId);
}

function goHome() {
  stopAllRadioAudio();
  renderHomeScreen();
  GameState.save();
}

window.addEventListener('resize', applyPhoneLayout);