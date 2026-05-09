// js/phone.js — phone shell renderer, app navigation

const APPS = [
  { id: 'messages', label: '信息', icon: '💬', gradient: 'linear-gradient(135deg, #34c759, #28a745)' },
  { id: 'browser', label: '浏览器', icon: '🌐', gradient: 'linear-gradient(135deg, #007aff, #0056d6)' },
  { id: 'radio', label: '电台', icon: '📻', gradient: 'linear-gradient(135deg, #ff3b30, #c62828)' },
  { id: 'phone', label: '电话', icon: '📞', gradient: 'linear-gradient(135deg, #34c759, #1b8e3a)' },
  { id: 'gallery', label: '相册', icon: '🖼️', gradient: 'linear-gradient(135deg, #ff9500, #e65100)' },
  { id: 'notes', label: '备忘录', icon: '📝', gradient: 'linear-gradient(135deg, #ffcc00, #f9a825)' },
  { id: 'mail', label: '邮件', icon: '✉️', gradient: 'linear-gradient(135deg, #007aff, #0044aa)' },
  { id: 'snoop', label: '窥探器', icon: '👁️', gradient: 'linear-gradient(135deg, #af52de, #6a1b9a)' },
];

const DOCK_APPS = ['messages', 'browser', 'radio', 'snoop'];

function renderPhoneShell() {
  const app = document.getElementById('app');
  const timeIcon = GameState.timeOfDay === 'day' ? '☀️' : '🌙';
  app.innerHTML = `
    <div class="phone-container">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="status-bar">
            <div class="status-left">
              <span class="status-time">9:41</span>
            </div>
            <div class="status-right">
              <span>${timeIcon}</span>
            </div>
          </div>
          <div id="screenContent"></div>
        </div>
      </div>
    </div>
  `;
  renderHomeScreen();
}

function renderHomeScreen() {
  GameState.currentApp = null;
  const timeIcon = GameState.timeOfDay === 'day' ? '☀️' : '🌙';
  const timeLabel = GameState.timeOfDay === 'day' ? '白天' : '深夜';
  const screen = document.getElementById('screenContent');

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
    dockHtml += `
      <div class="app-icon" onclick="openApp('${a.id}')">
        <div class="app-icon-inner" style="background: ${a.gradient}">
          ${a.icon}
          ${id === 'snoop' && GameState.snoopUnlocked ? '<span class="badge">1</span>' : ''}
        </div>
        <span class="app-label">${a.label}</span>
      </div>
    `;
  });

  screen.innerHTML = `
    <div class="home-screen">
      <div class="home-header">
        <span class="home-header-text">姐姐的手机</span>
        <button class="time-toggle" onclick="toggleTime()">${timeIcon} ${timeLabel}</button>
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
    snoop: typeof renderSnoopApp === 'function' ? renderSnoopApp : () => genericAppView('窥探器'),
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
  GameState.currentApp = appId;
  GameState.save();
  renderAppView(appId);
}

function goHome() {
  renderHomeScreen();
  GameState.save();
}

function toggleTime() {
  GameState.timeOfDay = GameState.timeOfDay === 'day' ? 'night' : 'day';
  GameState.save();
  if (GameState.currentApp) {
    renderAppView(GameState.currentApp);
  } else {
    renderHomeScreen();
  }
}
