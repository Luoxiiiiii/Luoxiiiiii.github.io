# 催眠主题手机解谜游戏 —— 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable web-based phone simulation puzzle game with 8 apps, day/night time system, puzzle mechanics, and a double hypnosis ending.

**Architecture:** Single-page application (SPA) rendered via JavaScript. No frameworks. One HTML entry point, modular CSS and JS files. State managed through a central store persisted to localStorage. Content data separated from rendering logic.

**Tech Stack:** HTML5 + CSS3 + Vanilla JavaScript (ES6+)

---

## File Structure

```
.
├── index.html                       # Entry point: phone shell + script/css imports
├── css/
│   ├── phone.css                    # Phone frame, status bar, home screen, transitions
│   └── apps.css                     # All app-specific styles + ending effects
├── js/
│   ├── state.js                     # Game state management, time system, localStorage
│   ├── phone.js                     # Phone shell renderer, app navigation
│   ├── apps.js                      # All 8 app renderers
│   ├── data.js                      # ALL narrative content data
│   ├── puzzles.js                   # Puzzle definitions, validation, rewards
│   └── ending.js                    # Ending detection + visual sequence
├── assets/
│   └── photos/                      # AI-generated photos (placeholders initially)
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-09-hypnosis-phone-game-design.md
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `css/phone.css`
- Create: `css/apps.css`
- Create: `css/` (dir)
- Create: `js/` (dir)
- Create: `assets/photos/` (dir)

- [ ] **Step 1: Create all directories**

```bash
mkdir -p "c:/Users/Administrator/Desktop/网页游戏/css"
mkdir -p "c:/Users/Administrator/Desktop/网页游戏/js"
mkdir -p "c:/Users/Administrator/Desktop/网页游戏/assets/photos"
```

- [ ] **Step 2: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>87.9 MHz</title>
  <link rel="stylesheet" href="css/phone.css">
  <link rel="stylesheet" href="css/apps.css">
</head>
<body>
  <div id="app"></div>
  <script src="js/data.js"></script>
  <script src="js/state.js"></script>
  <script src="js/puzzles.js"></script>
  <script src="js/apps.js"></script>
  <script src="js/phone.js"></script>
  <script src="js/ending.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Write stub files** — create each JS/CSS file with a minimal comment header confirming it loaded:

```javascript
// js/data.js — all game content data
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "init: project scaffolding with file structure"
```

---

### Task 2: Phone UI Shell + CSS

**Files:**
- Create: `css/phone.css` — phone frame, status bar, home screen, app grid
- Create: `css/apps.css` — app-specific styles, animations, ending effects
- Modify: `js/phone.js` — phone shell renderer

- [ ] **Step 1: Write phone.css — phone frame and home screen**

Key CSS elements needed:
- `.phone-container` — centers the phone on screen
- `.phone-frame` — 320×680, rounded corners (40px), black border, shadow
- `.phone-notch` — top-notch simulation (120×24px)
- `.status-bar` — flex row with time, signal, battery
- `.home-screen` — app grid container
- `.app-grid` — 4-column CSS grid for app icons
- `.app-icon` — 52×52px rounded icons with gradient backgrounds
- `.app-label` — 9px text under icons
- `.dock` — fixed bottom row with 4 apps
- `.home-indicator` — small pill at bottom

Base colors: background `#0a0a0a`, screen `#121212`, text white with opacity variants.

- [ ] **Step 2: Write apps.css — app-level styles**

Include style sections (commented) for each app. For now they can be minimal, covering:
- `.app-view` — full-screen view inside phone
- `.app-header` — top bar with back button and title
- `.app-content` — scrollable content area

Also include the ending effect keyframes:
```css
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
  100% { transform: translate(0); }
}
@keyframes spiral-overlay {
  0% { opacity: 0; transform: scale(1) rotate(0deg); }
  100% { opacity: 0.3; transform: scale(2) rotate(360deg); }
}
```

- [ ] **Step 3: Write phone.js — renderPhoneShell function**

```javascript
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
              <span class="status-signal">●●○○○</span>
            </div>
            <div class="status-right">
              <span class="status-battery">🔋</span>
            </div>
          </div>
          <div id="screenContent">
            <!-- Home screen or app view rendered here -->
          </div>
        </div>
      </div>
    </div>
  `;
  renderHomeScreen();
}
```

- [ ] **Step 4: Write renderHomeScreen function**

Renders the app grid with icons for all 8 apps + dock + home indicator + time toggle.

```javascript
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
```

The dock shows the 4 most-used apps: messages, browser, radio, snoop (with badge count 1).

Add a day/night toggle button in the home header area.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: phone UI shell with home screen and app grid"
```

---

### Task 3: App Navigation + Game State

**Files:**
- Modify: `js/phone.js` — app switching logic
- Create: `js/state.js` — central state management

- [ ] **Step 1: Write state.js — GameState object**

```javascript
const GameState = {
  currentApp: null,       // string or null (home)
  timeOfDay: 'day',       // 'day' | 'night'
  unlockedContent: {},    // { [contentId]: true }
  foundClues: [],         // array of clue IDs found
  snoopQueries: [],       // array of past queries
  puzzleProgress: {},     // { [puzzleId]: 'unsolved' | 'solved' }
  gamePhase: 1,           // 1=discovery, 2=investigation, 3=finale
  endingTriggered: false,
  snoopUnlocked: false,   // snoop tool becomes available after phase 1

  save() {
    localStorage.setItem('gameSave', JSON.stringify({
      timeOfDay: this.timeOfDay,
      foundClues: this.foundClues,
      snoopQueries: this.snoopQueries,
      puzzleProgress: this.puzzleProgress,
      gamePhase: this.gamePhase,
      endingTriggered: this.endingTriggered,
      snoopUnlocked: this.snoopUnlocked,
    }));
  },

  load() {
    const saved = localStorage.getItem('gameSave');
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(this, data);
    }
  },

  reset() {
    localStorage.removeItem('gameSave');
    // reset all fields to defaults
  }
};
```

- [ ] **Step 2: Add navigation to phone.js**

```javascript
function openApp(appId) {
  GameState.currentApp = appId;
  renderAppView(appId);
}

function goHome() {
  GameState.currentApp = null;
  renderHomeScreen();
}
```

The `renderAppView(appId)` function renders the app-specific view inside `#screenContent`, replacing the home screen. Each app renderer function is called based on `appId`.

- [ ] **Step 3: Add day/night toggle logic**

```javascript
function toggleTime() {
  GameState.timeOfDay = GameState.timeOfDay === 'day' ? 'night' : 'day';
  GameState.save();
  // Re-render current view
  if (GameState.currentApp) {
    renderAppView(GameState.currentApp);
  } else {
    renderHomeScreen();
  }
}
```

Update the status bar to show 🌙/☀️ indicator and the game time.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: app navigation system and game state with localStorage"
```

---

### Task 4: Messages App

**Files:**
- Modify: `js/data.js` — message content data
- Modify: `js/apps.js` — messages app renderer

- [ ] **Step 1: Write message data in data.js**

```javascript
const MESSAGE_DATA = {
  contacts: [
    {
      id: 'unknown',
      name: '未知号码',
      messages: [
        { id: 'u1', from: 'unknown', text: '今晚听了吗？', time: { day: null, night: '23:47' }, phase: 1 },
        { id: 'u2', from: 'me', text: '（未回复）', time: { day: null, night: '23:48' }, phase: 1 },
        { id: 'u3', from: 'unknown', text: '87.9 是个好频率。', time: { day: null, night: '00:12' }, phase: 1 },
        { id: 'u4', from: 'me', text: '嗯。', time: { day: null, night: '00:13' }, phase: 1 },
        { id: 'u5', from: 'unknown', text: '明天同一时间。', time: { day: null, night: '00:15' }, phase: 1 },
        // more messages...
      ]
    },
    {
      id: 'bestie',
      name: '小琳 ❤️',
      messages: [
        { id: 'b1', from: 'bestie', text: '你最近睡得好吗？', time: { day: '14:32', night: null }, phase: 1 },
        { id: 'b2', from: 'me', text: '还行吧', time: { day: '14:33', night: null }, phase: 1 },
        { id: 'b3', from: 'bestie', text: '你黑眼圈好重…要不要出来走走？', time: { day: '14:34', night: null }, phase: 1 },
        // more messages...
      ]
    },
    {
      id: 'mom',
      name: '妈妈',
      messages: [
        { id: 'm1', from: 'mom', text: '周末回不回家吃饭？', time: { day: '10:00', night: null }, phase: 1 },
        { id: 'm2', from: 'me', text: '再说吧', time: { day: '10:05', night: null }, phase: 1 },
        // more messages...
      ]
    },
    {
      id: 'mystery',
      name: '神秘人X',
      messages: [
        { id: 'x1', from: 'mystery', text: '步骤三完成了？', time: { day: null, night: '01:30' }, phase: 2 },
        { id: 'x2', from: 'me', text: '完成了。', time: { day: null, night: '01:31' }, phase: 2 },
        // more messages - only visible after puzzles unlocked...
      ]
    },
    {
      id: 'colleague',
      name: '工作群(3)',
      messages: [
        { id: 'c1', from: 'colleague', text: '小敏你今天开会怎么一直走神', time: { day: '09:15', night: null }, phase: 1 },
        // more messages...
      ]
    }
  ]
};
```

Each message has `time.day` or `time.night` controlling when it appears. Phase filtering: messages only show once gamePhase >= phase.

- [ ] **Step 2: Write messages app renderer in apps.js**

```javascript
function renderMessagesApp() {
  const contacts = getAvailableContacts(); // filters by time + phase
  let html = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">信息</span>
      </div>
      <div class="chat-list">
  `;
  contacts.forEach(c => {
    const lastMsg = c.messages[c.messages.length - 1];
    const unread = c.messages.filter(m => m.from !== 'me').length;
    html += `
      <div class="chat-item" onclick="openChat('${c.id}')">
        <div class="chat-avatar">${getAvatar(c.id)}</div>
        <div class="chat-info">
          <div class="chat-name">${c.name}</div>
          <div class="chat-preview">${lastMsg.text}</div>
        </div>
        ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
      </div>
    `;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}
```

- [ ] **Step 3: Write openChat function**

Shows a chat bubble view for a specific contact. Messages filter based on current time of day and game phase. Chat bubbles: sent (right-aligned, green) vs received (left-aligned, gray).

Include "social choice" mechanic for mystery contact: player can choose from predefined replies.

```javascript
function openChat(contactId) {
  const contact = MESSAGE_DATA.contacts.find(c => c.id === contactId);
  const visibleMsgs = contact.messages.filter(m => isMessageVisible(m));
  // render chat bubble view
  // if contact is mystery/unknown, show reply options at bottom
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: messages app with chat bubbles and time filtering"
```

---

### Task 5: Radio App

**Files:**
- Modify: `js/data.js` — radio content data
- Modify: `js/apps.js` — radio app renderer

- [ ] **Step 1: Write radio data in data.js**

```javascript
const RADIO_DATA = {
  minFreq: 87.0,
  maxFreq: 108.0,
  step: 0.1,
  specialFrequency: 87.9,
  stations: [
    { freq: 87.9, name: '---', nightContent: [
      { id: 'r1', text: '……放松……深呼吸……你感到困倦……', phase: 1 },
      { id: 'r2', text: '你听到我的声音了……跟随它……', phase: 1 },
      { id: 'r3', text: '白天的一切都是噪音……只有夜晚是真实的……', phase: 2 },
      { id: 'r4', text: '你也在听，不是吗？我知道你在。', phase: 2 },
      { id: 'r5', text: '她已经完成了她的部分。现在轮到你了。', phase: 3 },
    ]},
    // Other frequencies just show static noise
  ],
  listeningHistory: [
    { freq: 87.9, date: '05/06', time: '23:30' },
    { freq: 87.9, date: '05/07', time: '00:15' },
    { freq: 87.9, date: '05/07', time: '23:45' },
    { freq: 100.3, date: '05/05', time: '14:20' },
    { freq: 87.9, date: '05/08', time: '01:00' },
  ]
};
```

- [ ] **Step 2: Write radio app renderer**

A simulated radio interface with:
- Frequency display (large digital numbers)
- Tuning dial (slider or +/- buttons)
- Play/pause button
- Now-playing text area (shows night content at 87.9 at night, static otherwise)
- Listening history list at bottom

```javascript
function renderRadioApp() {
  const isNight = GameState.timeOfDay === 'night';
  const content = isNight ? getCurrentNightContent() : null;
  // If frequency is 87.9 and night: show content text scrolling
  // Otherwise: show static noise animation (CSS flicker)
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: radio app with frequency tuning and night content"
```

---

### Task 6: Browser App

**Files:**
- Modify: `js/data.js` — browser data
- Modify: `js/apps.js` — browser app renderer

- [ ] **Step 1: Write browser data in data.js**

```javascript
const BROWSER_DATA = {
  searchHistory: [
    { query: '深夜失眠怎么办', time: '23:15', date: '05/06' },
    { query: '87.9 电台 催眠', time: '23:30', date: '05/06' },
    { query: '催眠暗示 自我催眠', time: '00:10', date: '05/07' },
    { query: '87.9 MHz 论坛', time: '00:20', date: '05/07' },
    { query: '哪些症状说明被催眠了', time: '01:00', date: '05/08' },
    { query: '如何解除催眠暗示', time: '01:05', date: '05/08' },
  ],
  bookmarks: [
    { title: '深夜电台论坛 - 讨论区', url: 'bbs.radio879.com', id: 'forum' },
    { title: '催眠引导 · 睡前放松', url: 'hypno-guide.net', id: 'hypno' },
  ],
  pages: {
    forum: {
      title: '深夜电台论坛 - 87.9讨论区',
      content: '有人听过87.9吗？\n我连续听了三天，现在每天晚上到点就醒。\n回复1：我也听过！那个女声说的内容我醒来完全不记得。\n回复2：不要去听。我是认真的。\n回复3：楼主最近还好吗？……楼主？',
    },
    hypno: {
      title: '催眠引导 · 睡前放松',
      content: '这是一个看起来很正常的催眠放松页面，但底部有一行小字："合作电台：FM 87.9 MHz"',
    },
    // additional pages unlocked by puzzles
  }
};
```

- [ ] **Step 2: Write browser app renderer**

Tabs view: "历史记录" | "书签" | "打开页面"

- History tab: list of search queries, some clickable to "open" the search results
- Bookmarks tab: list of saved links, clicking opens the simulated page
- Open page view: simulated web page content with title bar, URL field, and content area

```javascript
function renderBrowserApp() {
  // Show three tab buttons at top
  // Default to "历史记录" tab
  // Each tab renders differently
}

function openBrowserPage(pageId) {
  // Render a simulated web page with title, URL bar, content
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: browser app with history, bookmarks, and simulated pages"
```

---

### Task 7: Gallery App

**Files:**
- Modify: `js/data.js` — gallery data
- Modify: `js/apps.js` — gallery renderer

- [ ] **Step 1: Write gallery data in data.js**

```javascript
const GALLERY_DATA = {
  albums: [
    {
      id: 'recent',
      name: '最近项目',
      photos: [
        { id: 'p1', src: 'assets/photos/placeholder.jpg', caption: '自拍 · 05/06', locked: false },
        { id: 'p2', src: 'assets/photos/placeholder.jpg', caption: '窗外 · 23:47', locked: false, clue: '对面楼有一个亮着灯的窗户' },
        { id: 'p3', src: 'assets/photos/placeholder.jpg', caption: '屏幕截图 · 00:12', locked: false, clue: '截了一张电台app的画面' },
        { id: 'p4', src: 'assets/photos/placeholder.jpg', caption: '??', locked: true, puzzleId: 'gallery-lock' },
      ]
    },
    // more albums...
  ]
};
```

- [ ] **Step 2: Write gallery app renderer**

Photo grid view (3 columns), tap to open full-screen lightbox. Locked photos show a lock overlay. Clicking a locked photo prompts for password.

```javascript
function renderGalleryApp() {
  // Grid of photo thumbnails
  // Locked items show 🔒 overlay
  // Click opens lightbox or prompts for password
}
```

- [ ] **Step 3: Write photo lightbox**

Fullscreen overlay within the phone, showing the photo with caption text. The clue text in the caption might contain puzzle hints.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: gallery app with photo grid, lightbox, and locked album"
```

---

### Task 8: Notes, Call Log, and Mail Apps

**Files:**
- Modify: `js/data.js` — notes, call log, mail data
- Modify: `js/apps.js` — three app renderers

- [ ] **Step 1: Write data for three apps in data.js**

```javascript
const NOTES_DATA = [
  { id: 'n1', title: '备忘', text: '买菜\n洗衣\n——\n今晚不要忘了听。', locked: false, phase: 1 },
  { id: 'n2', title: '…', text: '183※※※※ 她说这个号码有用。', locked: false, phase: 1 },
  { id: 'n3', title: '密码提示', text: '我们的纪念日。。。是几号来着？', locked: false, phase: 1, puzzle: true },
  { id: 'n4', title: '加密日记', text: '【需要密码】', locked: true, puzzleId: 'note-pw' },
  { id: 'n5', title: '意识流', text: '水…声音…跟随…不要抵抗…', locked: false, phase: 2 },
];

const CALLLOG_DATA = [
  { contact: '未知号码', type: '拨出', time: '23:45', date: '05/06', duration: '0:32' },
  { contact: '未知号码', type: '拨出', time: '00:10', date: '05/07', duration: '1:15' },
  { contact: '未知号码', type: '拨出', time: '23:50', date: '05/07', duration: '0:45' },
  { contact: '小琳', type: '拨入', time: '14:30', date: '05/07', duration: '3:20' },
  { contact: '未知号码', type: '拨出', time: '01:20', date: '05/08', duration: '5:00' },
];

const MAIL_DATA = [
  { from: 'noreply@radio879.com', subject: '欢迎加入 87.9 听众群', body: '亲爱的听众：\n感谢你收听 87.9 MHz。\n你的专属收听代码：R-879-14\n\n每晚23:00，我们等你。', read: false, phase: 1 },
  { from: 'system@notify.com', subject: '您的iCloud存储空间不足', body: '（这是一条正常系统通知）', read: true, phase: 1 },
  { from: 'unknown@temp.com', subject: 'RE: 你的问题', body: '你问的那个频率……不要再查了。', read: false, phase: 2 },
];
```

- [ ] **Step 2: Write renderers for notes, call log, and mail**

Notes: List view, tap to open. Locked notes show lock overlay, require password.

Call log: Table view with call entries.

Mail: Inbox list, tap to open email body.

All three follow the same pattern: header with back button, scrollable list, tap to open detail.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: notes, call log, and mail apps"
```

---

### Task 9: Snooping Tool App

**Files:**
- Modify: `js/apps.js` — snoop tool renderer
- Modify: `js/data.js` — snoop reference data
- Create: `js/puzzles.js` — puzzle engine with snoop integration

- [ ] **Step 1: Write snoop data**

```javascript
const SNOOP_KEYWORDS = [
  { word: '87.9', results: [
    { type: 'message', contact: '未知号码', content: '87.9 是个好频率。', link: 'chat:unknown' },
    { type: 'note', title: '备忘', content: '86.9…不对 87.9', link: 'note:n2' },
    { type: 'mail', subject: '欢迎加入 87.9 听众群', content: '你的专属收听代码：R-879-14', link: 'mail:0' },
    { type: 'radio', content: '特殊频率', link: 'app:radio' },
  ]},
  { word: '催眠', results: [
    { type: 'history', content: '搜索记录：催眠暗示 自我催眠', link: null },
    { type: 'mail', subject: 'RE: 你的问题', content: '不要再查了', link: 'mail:2' },
  ]},
  { word: 'R-879', results: [
    { type: 'clue', content: '★★★ 隐藏线索解锁！这是她在这个组织里的"听众编号"。搜索"14"得到更多信息。', link: null, secret: true },
  ]},
  // ... more keywords with increasingly deep results
];

const FINAL_SEARCH = {
  triggerWord: '救',
  result: '******** [最终序列触发] ********',
};
```

- [ ] **Step 2: Write snoop tool UI**

Search bar at top, results list below, history of past searches at bottom. Simulates a database search tool.

```javascript
function renderSnoopApp() {
  // Search input + submit button
  // Results area: shows matches from SNOOP_KEYWORDS
  // History: past queries with timestamps
  // Secret results get highlighted differently
}
```

- [ ] **Step 3: Integrate snoop with puzzle engine**

When a snoop result reveals a secret clue (marked `secret: true`), automatically unlock the corresponding content and increment game phase if needed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: snooping tool with keyword search and secret reveals"
```

---

### Task 10: Puzzle Engine

**Files:**
- Create: `js/puzzles.js` (if not already created in Task 9)
- Modify: `js/apps.js` — lock/prompt UI in gallery and notes

- [ ] **Step 1: Define puzzle data in puzzles.js**

```javascript
const PUZZLES = [
  {
    id: 'gallery-lock',
    type: 'password',
    prompt: '相册已加密。密码是姐姐的生日（MMDD）',
    answer: '0520',  // example
    hint: '备忘录里提到过"五月二十日"',
    reward: { type: 'unlock', target: 'photo:p4', clue: '解锁照片' },
    phase: 1,
  },
  {
    id: 'note-pw',
    type: 'password',
    prompt: '输入备忘录密码（提示：纪念日）',
    answer: '0520',  // same birthday, teaches player to cross-reference
    hint: '另一篇笔记写着"我们的纪念日"',
    reward: { type: 'unlock', target: 'note:n4', clue: '加密日记内容：关于电台的真实记录' },
    phase: 1,
  },
  {
    id: 'snoop-unlock',
    type: 'auto',
    condition: { foundClues: ['gallery-lock', 'note-pw'] },
    reward: { type: 'unlock', target: 'snoop', clue: '窥探器已解锁' },
    phase: 2,
  },
  {
    id: 'radio-sequence',
    type: 'sequence',
    steps: [
      { action: 'tune', freq: 87.9 },
      { action: 'snoop_search', word: '87.9' },
      { action: 'snoop_search', word: 'R-879' },
    ],
    reward: { type: 'phase', target: 3, clue: '你越来越接近真相了' },
    phase: 2,
  },
  {
    id: 'final-reveal',
    type: 'auto',
    condition: { gamePhase: 3, snoopQueries: ['救', 'help', 'SOS', '救我'] },
    reward: { type: 'ending', clue: 'TRIGGER_ENDING' },
    phase: 3,
  },
];
```

- [ ] **Step 2: Write puzzle validation functions**

```javascript
function checkPuzzleAnswer(puzzleId, answer) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  if (!puzzle) return false;
  const correct = String(answer).trim() === String(puzzle.answer).trim();
  if (correct) {
    applyReward(puzzle.reward);
    GameState.puzzleProgress[puzzleId] = 'solved';
    GameState.save();
    renderFeedback('正确！' + puzzle.reward.clue);
  } else {
    renderFeedback('不对，再想想');
  }
  return correct;
}

function applyReward(reward) {
  if (reward.type === 'unlock') {
    GameState.unlockedContent[reward.target] = true;
  } else if (reward.type === 'phase') {
    GameState.gamePhase = reward.target;
  } else if (reward.type === 'ending') {
    triggerEnding();
  }
}
```

- [ ] **Step 3: Add password prompt UI**

When clicking a locked gallery photo or locked note, show a modal overlay within the phone asking for password input. On correct answer, unlock and show content.

- [ ] **Step 4: Wire auto-unlock puzzles into state change listener**

When game state changes (clues found, phase changes), check `auto` type puzzles and trigger rewards automatically.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: puzzle engine with password and auto-unlock puzzles"
```

---

### Task 11: Narrative Content Integration

**Files:**
- Modify: `js/data.js` — complete all narrative content, hint chains, progression triggers

- [ ] **Step 1: Write full content narrative**

Ensure data.js contains complete content for the three-act structure:

**Act 1 content (phase 1):**
- Messages: unknown number (3-5 exchanges), bestie (3-5), mom (2-3), colleague (1-2)
- Browser: search history pointing to radio, forum page
- Radio: first night content (3 segments)
- Gallery: 3 photos (selfie, window, screenshot)
- Notes: 3 notes (shopping list with clue, password hint, encrypted diary)
- Call log: 3 calls to unknown number
- Mail: welcome email from radio, 1 normal notification
- Puzzles: gallery-lock, note-pw (both solvable within act 1)

**Act 2 content (phase 2):**
- Messages unlock: mystery person X (3-5 exchanges), bestie worried messages (2-3)
- Browser: hypnosis page with radio mention, search for "解除催眠"
- Radio: night content shifts (segments 3-4, more direct/creepy)
- Gallery: 1 new photo appears, 1 locked photo now unlockable
- Notes: 1 new note (意识流), encrypted diary now readable
- Mail: warning email from someone
- Snoop tool unlocks and becomes central
- Puzzles: radio-sequence leads to phase 3

**Act 3 content (phase 3):**
- All apps show final set of content
- Radio content directly addresses the player
- Snoop tool shows final search option
- Final reveal puzzle triggers ending

- [ ] **Step 2: Wire content filtering consistently**

Every app renderer must filter its content by:
1. `GameState.timeOfDay` — only show messages/items with matching time
2. `GameState.gamePhase` — only show items with `phase <= current phase`
3. `GameState.unlockedContent` — check locks

This is crucial for the game to work correctly.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete narrative content for all three acts"
```

---

### Task 12: Ending Sequence

**Files:**
- Create: `js/ending.js` — ending sequence controller and visual effects

- [ ] **Step 1: Write triggerEnding function in ending.js**

```javascript
function triggerEnding() {
  if (GameState.endingTriggered) return;
  GameState.endingTriggered = true;
  GameState.save();

  // Stage 1: phone screen glitches
  setTimeout(() => startGlitch(), 1000);
  // Stage 2: text distortion on screen
  setTimeout(() => startTextDistortion(), 3000);
  // Stage 3: spiral overlay appears
  setTimeout(() => showSpiralOverlay(), 6000);
  // Stage 4: final message
  setTimeout(() => showFinalMessage(), 10000);
}
```

- [ ] **Step 2: Write visual effect functions**

**Glitch effect (CSS + JS):**
```javascript
function startGlitch() {
  document.querySelector('.phone-frame').classList.add('glitching');
  // Random screen flickers via JS timer
  glitchInterval = setInterval(() => {
    const screen = document.querySelector('.phone-screen');
    screen.style.transform = `translate(${rand(-3,3)}px, ${rand(-2,2)}px)`;
    setTimeout(() => { screen.style.transform = ''; }, 100);
  }, 300);
}
```

CSS: `.glitching { animation: glitch 0.3s infinite; }`

**Text distortion:**
```javascript
function startTextDistortion() {
  // Replace app content with garbled text
  const content = document.getElementById('screenContent');
  content.innerHTML = content.innerHTML
    .split('').map((c, i) => Math.random() > 0.85 ? String.fromCharCode(c.charCodeAt(0) + rand(-2,2)) : c).join('');
  // Re-apply every 500ms
}
```

**Spiral overlay:**
```javascript
function showSpiralOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'spiral-overlay';
  overlay.innerHTML = '<svg>...</svg>'; // SVG spiral or CSS radial gradient
  document.querySelector('.phone-screen').appendChild(overlay);
}
```

**Final message:**
```javascript
function showFinalMessage() {
  document.getElementById('screenContent').innerHTML = `
    <div class="final-message">
      <p>现在你也是听众了。</p>
      <p class="fade-in">晚安。</p>
      <p class="fade-in delay">🌙</p>
    </div>
  `;
  clearInterval(glitchInterval);
  // After a moment, show the "new game" button
  setTimeout(() => {
    document.getElementById('screenContent').innerHTML += `
      <button onclick="GameState.reset(); renderPhoneShell();" class="restart-btn">
        重新开始
      </button>
    `;
  }, 3000);
}
```

- [ ] **Step 3: Add ending effect CSS to apps.css**

```css
.spiral-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%),
              repeating-conic-gradient(rgba(255,255,255,0.05) 0%, transparent 10%);
  animation: spiral-overlay 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 100;
}

.final-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  font-size: 18px;
  text-align: center;
  animation: fadeIn 2s ease;
}

.restart-btn {
  margin-top: 30px;
  padding: 8px 24px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  cursor: pointer;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: ending sequence with glitch, spiral overlay, and final message"
```

---

### Task 13: Final Integration and Polish

**Files:**
- Modify: `js/phone.js` — main.js integration
- Create: `js/main.js` — app initialization

- [ ] **Step 1: Write main.js — app bootstrap**

```javascript
document.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  renderPhoneShell();
  // Check if game was saved and resume
  if (GameState.currentApp) {
    openApp(GameState.currentApp);
  }
  // Check for ending trigger on load
  if (GameState.endingTriggered) {
    // Show ending screen
  }
});
```

- [ ] **Step 2: Add placeholder images**

Create a simple placeholder image generator or a single CSS-generated placeholder for photos until real AI images are ready:

```css
.photo-placeholder {
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 24px;
}
```

- [ ] **Step 3: Add loading/saving indicator**

When GameState.save() is called, briefly flash a "已保存" indicator on screen.

- [ ] **Step 4: Global CSS polish**

Ensure:
- No scrollbars visible on phone frame
- Smooth transitions between app views
- Proper font rendering (system fonts)
- All interactive elements have cursor: pointer and hover states
- Touch-friendly tap targets (minimum 44px)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: final integration with main.js, placeholders, and polish"
```

---

### Task 14: Deploy

- [ ] **Step 1: Create a simple README for friends**

```markdown
# 87.9 MHz

一款手机解谜游戏。

## 如何游玩

1. 打开 index.html 即可开始
2. 或者部署到 GitHub Pages / Netlify

## 游戏时长

约 45-90 分钟
```

- [ ] **Step 2: Test the full game flow**

Play through all three acts:
1. Start → home screen appears
2. Browse apps → content visible
3. Toggle day/night → content changes
4. Solve puzzles → unlocks new content
5. Reach ending → visual effects play
6. Reset works

- [ ] **Step 3: Deploy to GitHub Pages**

```bash
git push origin main
# Enable GitHub Pages in repo settings
```

Or provide Netlify drag-and-drop instructions.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "docs: add README with setup instructions"
```

---

## Verification

After each task, verify by:
1. Opening `index.html` in a browser
2. Checking the specific feature works (apps render, navigation works, content filters by time)
3. Checking browser console for errors
4. Ensuring localStorage persistence works (refresh page, state preserved)
5. Full play-through before declaring completion

## Content TODO (after core implementation)

- [ ] Generate AI photos for gallery app
- [ ] Write final draft of all narrative text
- [ ] Tune puzzle answers and hints
- [ ] Play-test with friends
