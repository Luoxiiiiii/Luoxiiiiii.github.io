// js/ending.js — ending sequence

let glitchInterval = null;
let distortionInterval = null;

function triggerEnding() {
  if (GameState.endingTriggered) return;
  GameState.endingTriggered = true;
  GameState.save();

  // Force navigation to home to show effects properly
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
    const text = content.innerText;
    if (!text || text.length === 0) return;
    // Replace random characters with similar unicode
    const garbled = text.split('').map(c => {
      if (Math.random() > 0.8) {
        return String.fromCharCode(c.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1));
      }
      return c;
    }).join('');
    // Only distort if content still exists
    const paragraphs = content.querySelectorAll('p, div');
    paragraphs.forEach(p => {
      if (Math.random() > 0.7) {
        p.style.opacity = Math.random() > 0.5 ? '1' : '0.3';
      }
    });
  }, 400);
}

function showSpiralOverlay() {
  // Remove any existing overlay
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
  // Clean up effects
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
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:calc(100% - 40px);padding:32px;text-align:center;">
      <div style="font-size:28px;margin-bottom:24px;animation:fadeIn 2s ease;">🌙</div>
      <p style="color:rgba(255,255,255,0.9);font-size:20px;margin-bottom:12px;animation:fadeIn 3s ease;font-weight:300;">
        现在你也是听众了。
      </p>
      <p style="color:rgba(255,255,255,0.5);font-size:16px;animation:fadeIn 4s ease 1s both;font-weight:300;">
        晚安。
      </p>
      <p style="color:rgba(255,255,255,0.15);font-size:12px;margin-top:40px;animation:fadeIn 2s ease 3s both;">
        87.9 MHz
      </p>
      <button onclick="GameState.reset();location.reload();"
        style="margin-top:32px;padding:10px 28px;background:transparent;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.5);border-radius:20px;font-size:13px;cursor:pointer;animation:fadeIn 2s ease 4s both;">
        重新开始
      </button>
    </div>
  `;
}
