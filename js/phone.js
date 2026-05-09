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
  app.innerHTML = `
    <div class="phone-container">
      <div class="phone-frame">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <div class="status-bar">
            <div class="status-left">
              <span class="status-time" id="statusTime">9:41</span>
            </div>
            <div class="status-right">
              <span id="statusTimeIcon">☀️</span>
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
  const timeIcon = GameState.timeOfDay === 'day' ? '☀️' : '🌙';
  const timeLabel = GameState.timeOfDay === 'day' ? '白天' : '深夜';
  const screen = document.getElementById('screenContent');

  let appIconsHtml = '';
  APPS.forEach(a => {
    const isDock = DOCK_APPS.includes(a.id);
    if (isDock) return; // dock apps rendered separately
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
    const badge = id === 'snoop' && !GameState.snoopUnlocked ? '' : '';
    dockHtml += `
      <div class="app-icon" onclick="openApp('${a.id}')">
        <div class="app-icon-inner" style="background: ${a.gradient}">
          ${a.icon}
          ${badge ? '<span class="badge">1</span>' : ''}
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

function toggleTime() {
  GameState.timeOfDay = GameState.timeOfDay === 'day' ? 'night' : 'day';
  renderHomeScreen();
}

// openApp will be implemented in apps.js — this stub ensures calls do not error
function openApp(appId) {
  console.log('openApp:', appId);
}
