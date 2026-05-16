// js/ending.js — ending sequence

let glitchInterval = null;
let distortionInterval = null;

function triggerEnding() {
  if (GameState.endingTriggered) return;
  GameState.endingTriggered = true;
  GameState.save();

  goHome();

  // Stage 1: Phone screen glitches (1s)
  setTimeout(() => startGlitch(), 1000);

  // Stage 2: Text distortion (3s)
  setTimeout(() => startTextDistortion(), 3000);

  // Stage 3: Spiral overlay (6s)
  setTimeout(() => showSpiralOverlay(), 6000);

  // Stage 4: Final message (10s)
  setTimeout(() => showFinalMessage(), 10000);
}

function startGlitch() {
  const frame = document.querySelector('.phone-frame');
  if (frame) frame.classList.add('glitching');

  glitchInterval = setInterval(() => {
    const screen = document.querySelector('.phone-screen');
    if (!screen) return;
    const x = (Math.random() * 6) - 3;
    const y = (Math.random() * 4) - 2;
    screen.style.transform = `translate(${x}px, ${y}px)`;
    setTimeout(() => {
      screen.style.transform = '';
    }, 80);
  }, 200);
}

function startTextDistortion() {
  const content = document.getElementById('screenContent');
  if (!content) return;

  distortionInterval = setInterval(() => {
    const paragraphs = content.querySelectorAll('p, div');
    paragraphs.forEach(p => {
      if (Math.random() > 0.7) {
        p.style.opacity = Math.random() > 0.5 ? '1' : '0.3';
      }
    });
  }, 400);
}

function showSpiralOverlay() {
  const existing = document.querySelector('.spiral-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'spiral-overlay';
  const phoneScreen = document.querySelector('.phone-screen');
  if (phoneScreen) {
    phoneScreen.appendChild(overlay);
  }
}

function showFinalMessage() {
  const frame = document.querySelector('.phone-frame');
  if (frame) frame.classList.remove('glitching');
  if (glitchInterval) clearInterval(glitchInterval);
  if (distortionInterval) clearInterval(distortionInterval);

  const overlay = document.querySelector('.spiral-overlay');
  if (overlay) overlay.remove();

  const screen = document.querySelector('.phone-screen');
  if (screen) screen.style.transform = '';

  const screenContent = document.getElementById('screenContent');
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100% - 40px);padding:24px;text-align:center;background:#000;">
      <div style="animation:fadeIn 1.5s ease 0.5s both;max-width:280px;">
        <p style="color:rgba(255,255,255,0.9);font-size:19px;line-height:1.7;font-weight:400;margin-bottom:20px;letter-spacing:1px;">
          你查到了所有线索。<br>拼出了完整的故事。
        </p>
        <p style="color:rgba(255,255,255,0.7);font-size:17px;line-height:1.6;font-weight:300;margin-bottom:20px;">
          姐姐完成了三个阶段，变成了"她"。<br>
          下一个阶段——引入新人——<br>需要她把 87.9 分享给一个人。
        </p>
        <p style="color:#ffcc00;font-size:20px;line-height:1.8;font-weight:600;margin-bottom:20px;text-shadow:0 0 12px rgba(255,204,0,0.4);">
          你拿到了她的手机。<br>
          你调查了 87.9。<br>
          你收听了 87.9。
        </p>
        <p style="color:#fff;font-size:22px;line-height:1.6;font-weight:700;margin-bottom:24px;text-shadow:0 0 20px rgba(255,255,255,0.3);">
          你有没有注意到，<br>你盯着这个屏幕多久了？
        </p>
      </div>
      <p style="color:rgba(255,255,255,0.08);font-size:14px;margin-top:20px;letter-spacing:4px;font-family:monospace;animation:fadeIn 2s ease 6s both;">
        R-879-15
      </p>
      <button onclick="followSupremeMaster()"
        style="margin-top:24px;padding:12px 32px;background:#1a0000;border:2px solid #8b0000;color:#cc3333;border-radius:6px;font-size:13px;cursor:pointer;animation:fadeIn 2s ease 7s both;letter-spacing:3px;font-family:serif;text-shadow:0 0 6px rgba(200,0,0,0.5);"
        onmouseover="this.style.background='#2a0000';this.style.color='#ff4444';this.style.textShadow='0 0 12px rgba(255,0,0,0.6)';"
        onmouseout="this.style.background='#1a0000';this.style.color='#cc3333';this.style.textShadow='0 0 6px rgba(200,0,0,0.5)';">
        服从无上主人
      </button>
    </div>
  `;
}

/* ===== Auto-type helper ===== */
function typeIntoField(field, text, done, delay) {
  if (!field) {
    if (typeof done === 'function') done();
    return;
  }
  const stepDelay = delay || 120;
  field.value = '';
  field.focus();
  let index = 0;
  const timer = setInterval(() => {
    field.value += text[index];
    field.dispatchEvent(new Event('input', { bubbles: true }));
    index += 1;
    if (index >= text.length) {
      clearInterval(timer);
      if (typeof done === 'function') setTimeout(done, stepDelay + 80);
    }
  }, stepDelay);
}

/* ===== Follow Supreme Master: auto-type login ===== */
function followSupremeMaster() {
  // Clear ending effects
  const frame = document.querySelector('.phone-frame');
  if (frame) frame.classList.remove('glitching');
  if (glitchInterval) clearInterval(glitchInterval);
  if (distortionInterval) clearInterval(distortionInterval);

  const overlay = document.querySelector('.spiral-overlay');
  if (overlay) overlay.remove();

  const screen = document.querySelector('.phone-screen');
  if (screen) screen.style.transform = '';

  // Navigate to member login via browser context
  GameState.currentApp = 'browser';
  GameState._lastUrl = 'radio879.com/member';
  GameState.save();

  // Force render member login (even if already logged in)
  renderMemberLogin(true);

  // Auto-type after render
  const userField = document.getElementById('memberUser');
  const passField = document.getElementById('memberPass');
  const loginBtn = document.getElementById('memberLoginBtn');
  if (loginBtn) loginBtn.disabled = true;

  typeIntoField(userField, 'R-879-15', () => {
    typeIntoField(passField, 'R-879-140', () => {
      if (loginBtn) loginBtn.disabled = false;
      // Trigger login
      dispatchEventSafely(loginBtn, 'click');
    }, 100);
  }, 100);
}

function dispatchEventSafely(el, eventType) {
  if (!el) return;
  el.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true }));
}

/* ===== Ending Login page (standalone fallback) ===== */
function showEndingLogin() {
  followSupremeMaster();
}

function renderCorruptionDocument() {
  const screenContent = document.getElementById('screenContent');
  if (!screenContent) return;

  screenContent.innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">内部文件 — R-879-15</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(0,255,0,0.5);font-size:11px;">🟢</span>
          <div class="webpage-url">radio879.com/internal/15 — 已登录</div>
        </div>
        <div class="webpage-body" id="internal15Body" style="white-space:pre-wrap;font-family:monospace;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.8;padding:20px 16px;">
        </div>
      </div>
    </div>
  `;

  const lines = [
    '=== 受试者评估报告 ===',
    '',
    '编号：R-879-15',
    '姓名：—',
    '引入人：R-879-14',
    '',
    '接触方式：通过 R-879-14 的遗留设备自行接入',
    '',
    '═══════════════════════',
    '',
    '行为记录：',
    '',
    '[Day 1] 解锁设备。浏览短信、通话记录。',
    '        发现 87.9 频率。',
    '',
    '[Day 2] 收听 87.9 MHz。',
    '        访问电台网站。',
    '',
    '[Day 3] 破解加密相册。',
    '        发现坐标线索。',
    '        解密日记第一页。',
    '',
    '[Day 4] 拨通 400-879-2230。',
    '        获取网站地址。',
    '        登录会员系统。',
    '',
    '[Day 5] 解密日记第二页。',
    '        搜索完整资料库。',
    '        发现隐藏真相。',
    '',
    '═══════════════════════',
    '',
    '评估：',
    '目标展现了极强的信息搜集和解谜能力。',
    '自主接触全程无需引导。',
    '每个"发现"都按预期推进。',
    '',
    '备注：',
    '目标对自己正在被观察毫无察觉。',
    '正如 R-879-14 一样，"调查"即是接触。',
    '每一步都在为转化做准备。',
    '',
    '═══════════════════════',
    '',
    '当前转化进度：87%',
    '预计完成：14 天',
    '',
    '欢迎来到 87.9，R-879-15。',
    '',
    '=== 文件结束 ===',
  ];

  const body = document.getElementById('internal15Body');
  if (!body) return;
  let idx = 0;

  const interval = setInterval(() => {
    if (idx < lines.length) {
      const div = document.createElement('div');
      div.textContent = lines[idx];
      div.style.animation = 'fadeIn 0.3s ease';
      body.appendChild(div);
      idx++;
      body.scrollTop = body.scrollHeight;
    } else {
      clearInterval(interval);
      const btn = document.createElement('button');
      btn.textContent = '重新开始';
      btn.onclick = function() { GameState.reset(); location.reload(); };
      btn.style.cssText = 'margin-top:24px;padding:8px 20px;background:transparent;border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.15);border-radius:4px;font-size:10px;cursor:pointer;letter-spacing:2px;font-family:monospace;';
      body.appendChild(btn);
    }
  }, 350);
}
