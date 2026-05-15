// js/main.js — app initialization

function showIntro() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="introOverlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a0a;z-index:1000;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:360px;padding:32px;text-align:center;animation:fadeIn 2s ease;">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:2px;margin-bottom:24px;">87.9 MHz</p>
        <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:2;margin-bottom:16px;">
          姐姐最近不太对劲。
        </p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;line-height:1.9;margin-bottom:10px;">
          她总是凌晨醒来，却不记得自己做了什么。<br>
          她的黑眼圈越来越重。<br>
          她开始说一些奇怪的话。
        </p>
        <p style="color:rgba(255,255,255,0.45);font-size:13px;line-height:1.9;margin-bottom:10px;">
          前天，她不见了。<br>
          只留下了这部手机。
        </p>
        <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.9;margin-bottom:32px;">
          手机里有她留下的线索。<br>
          她说，如果有一天她不在了——<br>
          打开手机，按她说的做。
        </p>
        <p style="color:rgba(255,255,255,0.25);font-size:12px;margin-bottom:32px;">
          现在是深夜 23:47。<br>
          你打开了姐姐的手机。
        </p>
        <p style="color:rgba(255,255,255,0.12);font-size:10px;letter-spacing:2px;margin-bottom:16px;">洛 溪 与 茶 出 品</p>
        <div style="margin-bottom:24px;">
          <div onclick="toggleDisclaimer()" style="color:rgba(255,255,255,0.2);font-size:10px;cursor:pointer;letter-spacing:1px;user-select:none;transition:color 0.2s;" onmouseover="this.style.color='rgba(255,255,255,0.4)'" onmouseout="this.style.color='rgba(255,255,255,0.2)'">
            ▸ 免责条款
          </div>
          <div id="disclaimerContent" style="display:none;margin-top:8px;padding:10px 12px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid rgba(255,255,255,0.06);text-align:left;max-height:200px;overflow-y:auto;">
            <p style="color:rgba(255,255,255,0.35);font-size:9px;line-height:1.7;margin-bottom:6px;">
              1. 本作品为纯娱乐向网页解密游戏，一切剧情请勿与现实对应，所有催眠相关元素仅为剧情氛围设计，绝非专业医疗、心理治疗、临床催眠工具，不具备任何治疗、助眠、心理干预功效。
            </p>
            <p style="color:rgba(255,255,255,0.35);font-size:9px;line-height:1.7;margin-bottom:6px;">
              2. 未满18周岁、患有精神/神经/心脑血管疾病、存在严重心理创伤、情绪异常、意识不清醒者，严禁体验。
            </p>
            <p style="color:rgba(255,255,255,0.35);font-size:9px;line-height:1.7;margin-bottom:6px;">
              3. 体验过程中若出现头晕、困倦、心悸、情绪不适等任何身体/心理异常，请立即关闭游戏，自行休息调整；症状持续请及时就医。
            </p>
            <p style="color:rgba(255,255,255,0.35);font-size:9px;line-height:1.7;margin-bottom:6px;">
              4. 本游戏为用户自愿免费体验，因个人违规参与、未及时停止体验、自身身体/心理状况引发的一切不良后果及损失，由体验者自行承担，游戏制作者方不承担任何法律及赔偿责任。
            </p>
            <p style="color:rgba(255,255,255,0.35);font-size:9px;line-height:1.7;">
              5. 本游戏内容仅供个人非商业体验，禁止复制、篡改、商用及非法传播。
            </p>
            <p style="color:rgba(255,255,255,0.2);font-size:8px;line-height:1.6;margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.05);">
              温馨提示：理性娱乐，健康至上，切勿在驾驶、操作器械等危险场景下体验。
            </p>
          </div>
        </div>
        <button id="startGameBtn" onclick="startGame()"
          style="padding:12px 36px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.7);border-radius:24px;font-size:14px;cursor:pointer;transition:all 0.3s;letter-spacing:1px;"
          onmouseover="this.style.background='rgba(255,255,255,0.12)';this.style.color='#fff';"
          onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.7)';">
          开始游戏
        </button>
      </div>
    </div>
  `;
}

function toggleDisclaimer() {
  const el = document.getElementById('disclaimerContent');
  const toggle = el.previousElementSibling;
  if (el.style.display === 'block') {
    el.style.display = 'none';
    toggle.textContent = '▸ 免责条款';
  } else {
    el.style.display = 'block';
    toggle.textContent = '▾ 免责条款';
  }
}

function startGame() {
  const overlay = document.getElementById('introOverlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.8s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 800);
  }
  renderPhoneShell();
  if (GameState.currentApp) {
    openApp(GameState.currentApp);
  }
  if (GameState.endingTriggered) {
    triggerEnding();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  showIntro();
  checkAutoPuzzles();
});
