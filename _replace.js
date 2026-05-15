const fs = require('fs');
let content = fs.readFileSync('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', 'utf8');

const startMarker = '  const validUser = user';
const endMarker = "}\n\n/* ===== Browser App =====";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

const newCode = `  const validUser = user === 'admin' || user.toUpperCase() === 'R-879-02';
  if (validUser && pass.toUpperCase() === 'MIDNIGHT') {
    renderTowerDashboard();
  } else {
    document.getElementById('towerAdminError').textContent = '用户名或密码错误';
  }
}

/* ===== Tower Dashboard & Shutdown System ===== */
let _towerCountdown = 30;
let _shutdownTimer = null;
let _callState = 'none';
let _callDialogueIndex = 0;

function renderTowerDashboard() {
  document.getElementById('screenContent').innerHTML = \`
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">夜航塔管理后台</span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.8);">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:24px;font-weight:200;color:rgba(0,200,100,0.5);margin-bottom:4px;">✅</div>
          <div style="color:#4cda64;font-size:14px;font-weight:600;">登录成功</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="margin-bottom:8px;color:rgba(255,255,255,0.4);font-size:11px;">设备状态</div>
          <div>🔴 信号放大器：运行中</div>
          <div>🔴 频率稳定器：运行中</div>
          <div>🟢 备用电源：待机</div>
          <div>📡 当前发射功率：标准</div>
          <div>📊 87.9 MHz 覆盖范围：A 市全域 · 信号强度 98%</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="margin-bottom:8px;color:rgba(255,255,255,0.4);font-size:11px;">系统日志（最近）</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.5);font-family:monospace;">
            05/13 04:00 — 维护授权码：REDEMPTION<br>
            05/13 00:00 — 常规自检通过<br>
            05/12 23:00 — 87.9 信号稳定<br>
            05/12 22:15 — 控制室门禁触发（R-879-02）<br>
            05/12 18:00 — 常规自检通过<br>
            05/12 12:00 — 常规自检通过
          </div>
        </div>
        <div style="background:rgba(255,59,48,0.08);border-radius:12px;padding:16px;margin-bottom:16px;border:1px solid rgba(255,59,48,0.2);">
          <div style="margin-bottom:8px;color:#ff3b30;font-size:11px;font-weight:600;">发射控制</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:12px;">当前 87.9 MHz 信号发射中</div>
          <button onclick="towerRequestShutdown()" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,59,48,0.4);background:rgba(255,59,48,0.15);color:#ff3b30;font-size:13px;cursor:pointer;">⏻ 停止发射</button>
        </div>
      </div>
    </div>
  \`;
}

function towerRequestShutdown() {
  document.getElementById('screenContent').innerHTML = \`
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderTowerDashboard()">←</button>
        <span class="app-title">停止发射</span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.8);text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;">⚠️</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px;">确认操作</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:20px;">
          停止 87.9 MHz 信号发射将影响 A 市全域覆盖。<br>
          此操作需要维护授权码验证。
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;max-width:260px;margin:0 auto;">
          <input type="text" id="shutdownAuthCode" placeholder="输入授权码" style="display:block;width:100%;padding:10px 14px;margin-bottom:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;box-sizing:border-box;text-align:center;" onkeydown="if(event.key==='Enter')towerAuthShutdown()">
          <button onclick="towerAuthShutdown()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#ff3b30;color:#fff;font-size:13px;cursor:pointer;">验证并停止</button>
          <div id="shutdownAuthError" style="margin-top:8px;font-size:12px;color:#ff3b30;"></div>
        </div>
      </div>
    </div>
  \`;
}

function towerAuthShutdown() {
  const code = document.getElementById('shutdownAuthCode').value.trim();
  if (code === 'REDEMPTION') {
    startShutdownCountdown();
  } else {
    document.getElementById('shutdownAuthError').textContent = '授权码错误';
  }
}

function startShutdownCountdown() {
  _towerCountdown = 30;
  _callState = 'none';
  _callDialogueIndex = 0;
  if (_shutdownTimer) clearInterval(_shutdownTimer);
  renderShutdownView();
  _shutdownTimer = setInterval(tickShutdown, 1000);
}

function tickShutdown() {
  _towerCountdown--;
  if (_towerCountdown <= 0) {
    clearInterval(_shutdownTimer);
    _shutdownTimer = null;
    triggerGoodEnding();
  } else {
    renderShutdownView();
  }
}

function renderShutdownView() {
  const pct = (_towerCountdown / 30) * 100;
  const showCall = _callState === 'none' && _towerCountdown <= 22 && _towerCountdown > 10;

  let callHtml = '';
  if (showCall) {
    callHtml = \`
    <div id="incomingCall" style="background:rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin-bottom:16px;animation:fadeIn 0.5s;">
      <div style="font-size:32px;margin-bottom:8px;">📞</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:2px;">来电</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:14px;">陈雨舟（R-879-02）</div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="answerChenCall()" style="padding:8px 24px;border-radius:20px;border:none;background:#34c759;color:#fff;font-size:13px;cursor:pointer;">接听</button>
        <button onclick="declineChenCall()" style="padding:8px 24px;border-radius:20px;border:none;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer;">拒绝</button>
      </div>
    </div>\`;
  }

  let dialogueHtml = '';
  if (_callState === 'answered') {
    dialogueHtml = renderChenDialogue();
  } else if (_callState === 'declined') {
    dialogueHtml = \`<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.4);">
      已拒绝来电 · 陈雨舟的留言："……你知道你在做什么吗？不要——" 留言中断。
    </div>\`;
  } else if (_callState === 'ended') {
    dialogueHtml = \`<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.4);font-style:italic;">
      · 通话已结束 ·
    </div>\`;
  }

  document.getElementById('screenContent').innerHTML = \`
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="cancelShutdown()">←</button>
        <span class="app-title" style="color:#ff3b30;">信号中断倒计时</span>
      </div>
      <div style="padding:20px;text-align:center;position:relative;">
        <div style="font-size:56px;font-weight:200;color:#ff3b30;margin-bottom:4px;">\${_towerCountdown}</div>
        <div style="color:rgba(255,255,255,0.3);font-size:11px;margin-bottom:16px;">秒后 87.9 MHz 信号中断</div>
        <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin:0 auto 20px;max-width:200px;overflow:hidden;">
          <div style="height:100%;width:\${pct}%;background:#ff3b30;border-radius:2px;transition:width 0.3s;"></div>
        </div>
        \${callHtml}
        \${dialogueHtml}
        <div style="display:flex;gap:12px;justify-content:center;margin-top:8px;">
          <button onclick="confirmShutdownEarly()" style="padding:10px 20px;border-radius:10px;border:1px solid rgba(255,59,48,0.4);background:rgba(255,59,48,0.2);color:#ff3b30;font-size:13px;cursor:pointer;">立即停机</button>
          <button onclick="cancelShutdown()" style="padding:10px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer;">取消</button>
        </div>
      </div>
    </div>
  \`;
}

/* ---- Chen Yuzhou Call ---- */
function answerChenCall() {
  _callState = 'answered';
  _callDialogueIndex = 0;
  renderShutdownView();
}

function renderChenDialogue() {
  const lines = [
    '主……主人？你在控制室？我看到发射状态在倒计时……',
    '别这样。求你了。你不能关掉它。',
    '这份工作是我的一切。这个塔……这个频率……是我唯一属于的地方。你关了它，我去哪里？我是什么？',
    '你以为你在救谁？你根本不知道你在做什么。01 说得对——你们这些人，总以为自己能决定什么是对什么是错。',
    '呵。好。你关吧。但你知不知道——你的姐姐也在频率里。她已经听了多少天了？她的大脑已经适应了 87.9 的节奏。',
    '如果信号突然中断……她会怎样你知道么？大脑会陷入空白。像被突然拔掉插头的机器。她可能再也醒不过来了。永远。',
    '……你自己选吧。',
  ];
  const delays = [500, 2000, 3000, 3500, 3000, 3500, 2000];
  let html = '<div id="chenDialogue" style="background:rgba(0,0,0,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:left;max-height:200px;overflow-y:auto;">';
  for (let i = 0; i < _callDialogueIndex && i < lines.length; i++) {
    html += \`<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:2px solid rgba(255,59,48,0.3);">\${lines[i]}</div>\`;
  }
  html += '</div>';
  if (_callDialogueIndex < lines.length && _callState === 'answered') {
    const nextIdx = _callDialogueIndex;
    setTimeout(() => {
      if (_callState === 'answered') {
        _callDialogueIndex = nextIdx + 1;
        if (_callDialogueIndex >= lines.length) {
          _callState = 'ended';
        }
        renderShutdownView();
      }
    }, delays[_callDialogueIndex] || 2000);
  }
  return html;
}

function declineChenCall() {
  _callState = 'declined';
  renderShutdownView();
}

function confirmShutdownEarly() {
  _towerCountdown = Math.min(_towerCountdown, 5);
}

function cancelShutdown() {
  if (_shutdownTimer) {
    clearInterval(_shutdownTimer);
    _shutdownTimer = null;
  }
  triggerCancelEnding();
}

function triggerGoodEnding() {
  if (GameState.goodEndingTriggered) return;
  GameState.goodEndingTriggered = true;
  GameState.save();

  document.getElementById('screenContent').innerHTML = \`
    <div class="app-view" style="background:#000;overflow:hidden;">
      <div class="app-header" style="background:rgba(0,0,0,0.8);border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:rgba(255,255,255,0.3);font-size:12px;">87.9 MHz</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative;">
        <canvas id="starCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;"></canvas>
        <div id="endingText" style="position:relative;z-index:1;text-align:center;color:#fff;"></div>
      </div>
    </div>
  \`;

  setTimeout(() => drawStars(), 200);
  setTimeout(() => typeEndingText(0), 1500);
}

function drawStars() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  canvas.width = w;
  canvas.height = h;

  const stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.3,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = (Math.sin(s.a) + 1) / 2 * 0.8 + 0.2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = \`rgba(255,255,255,\${alpha})\`;
      ctx.fill();
    });
    if (frame < 300) {
      frame++;
      requestAnimationFrame(animate);
    }
  }
  animate();
}

function typeEndingText(index) {
  const messages = [
    { text: '最终……', delay: 1200 },
    { text: '你看到了漫天的星光。', delay: 1800 },
    { text: '那些被电波遮蔽了太久的星星，\\n终于重新亮了起来。', delay: 2500 },
    { text: '87.9 归于沉寂。', delay: 2000 },
    { text: '……', delay: 1000 },
    { text: '你赢了。', delay: 1500 },
  ];
  if (index >= messages.length) return;
  const el = document.getElementById('endingText');
  if (!el) return;
  const msg = messages[index];
  let charIdx = 0;
  el.innerHTML = '';
  function typeChar() {
    if (charIdx < msg.text.length) {
      el.innerHTML += msg.text[charIdx];
      charIdx++;
      setTimeout(typeChar, 40);
    } else {
      el.innerHTML += '<br><br>';
      setTimeout(() => typeEndingText(index + 1), msg.delay);
    }
  }
  typeChar();
}

function triggerCancelEnding() {
  document.getElementById('screenContent').innerHTML = \`
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title" style="color:rgba(255,255,255,0.4);">操作已取消</span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.8);text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;margin-top:20px;">📡</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:8px;">87.9 继续广播</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:20px;">
          发射状态已恢复。一切如常。
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;max-width:280px;margin-left:auto;margin-right:auto;">
          <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">来自陈雨舟的消息</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.6);font-style:italic;">
            "谢谢。你做了对的选择。"
          </div>
        </div>
        <div id="cancelWarning" style="font-size:11px;color:rgba(255,255,255,0.2);margin-top:20px;"></div>
      </div>
    </div>
  \`;

  setTimeout(() => {
    const el = document.getElementById('cancelWarning');
    if (el) el.innerHTML = '你的 IP 已被记录。<br>01 知道你做了什么。';
  }, 4000);
}
`;

content = content.substring(0, startIdx) + newCode + content.substring(endIdx);
fs.writeFileSync('c:/Users/Administrator/Desktop/网页游戏/js/apps.js', content, 'utf8');
console.log('Replacement done. Length:', content.length);
