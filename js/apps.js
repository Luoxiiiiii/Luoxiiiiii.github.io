// js/apps.js — all app renderers

function isMessageVisible(msg) {
  // Check time of day
  if (GameState.timeOfDay === 'day' && msg.time.day === null) return false;
  if (GameState.timeOfDay === 'night' && msg.time.night === null) return false;
  // Check game phase
  if (msg.phase > GameState.gamePhase) return false;
  return true;
}

function getAvatar(contactId) {
  const avatars = {
    unknown: '📡',
    bestie: '👩',
    mom: '👩‍🦱',
    mystery: '❌',
    colleague: '💼',
  };
  return avatars[contactId] || '📱';
}

function renderMessagesApp() {
  const contacts = MESSAGE_DATA.contacts.filter(c =>
    c.messages.some(m => isMessageVisible(m))
  );
  let html = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">信息</span>
      </div>
      <div class="chat-list">
  `;
  contacts.forEach(c => {
    const visibleMsgs = c.messages.filter(m => isMessageVisible(m));
    const lastMsg = visibleMsgs[visibleMsgs.length - 1];
    const unread = visibleMsgs.filter(m => m.from !== 'me').length;
    html += `
      <div class="chat-item" onclick="openChat('${c.id}')">
        <div class="chat-avatar" style="background: rgba(255,255,255,0.06)">${getAvatar(c.id)}</div>
        <div class="chat-info">
          <div class="chat-name">${c.name}</div>
          <div class="chat-preview">${lastMsg ? lastMsg.text : ''}</div>
        </div>
        ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
      </div>
    `;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}

function openChat(contactId) {
  const contact = MESSAGE_DATA.contacts.find(c => c.id === contactId);
  if (!contact) return;
  const visibleMsgs = contact.messages.filter(m => isMessageVisible(m));

  let bubblesHtml = '';
  visibleMsgs.forEach(m => {
    const isSent = m.from === 'me';
    const timeStr = m.time.day || m.time.night || '';
    bubblesHtml += `
      <div class="message-bubble ${isSent ? 'sent' : 'received'}">
        ${m.text}
        <div class="message-time">${timeStr}</div>
      </div>
    `;
  });

  // Social choice mechanic: if contact is mystery or unknown, show reply options
  const showReplies = (contactId === 'mystery' || contactId === 'unknown') && GameState.gamePhase >= 2;
  let replyHtml = '';
  if (showReplies) {
    replyHtml = `
      <div class="chat-reply-bar">
        <button class="reply-option" onclick="sendReply('${contactId}', '听了')">听了</button>
        <button class="reply-option" onclick="sendReply('${contactId}', '你是谁')">你是谁</button>
        <button class="reply-option" onclick="sendReply('${contactId}', '我不知道你在说什么')">我不知道你在说什么</button>
      </div>
    `;
  }

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderMessagesApp()">←</button>
        <span class="app-title">${contact.name}</span>
      </div>
      <div class="chat-view">
        <div class="chat-messages">
          ${bubblesHtml}
        </div>
        ${replyHtml}
      </div>
    </div>
  `;

  // Auto-scroll to bottom
  const msgsDiv = document.querySelector('.chat-messages');
  if (msgsDiv) msgsDiv.scrollTop = msgsDiv.scrollHeight;
}

function sendReply(contactId, text) {
  // Add player's reply to visual chat
  const msgsDiv = document.querySelector('.chat-messages');
  const timeStr = GameState.timeOfDay === 'day' ? '现在' : '深夜';
  msgsDiv.innerHTML += `
    <div class="message-bubble sent">
      ${text}
      <div class="message-time">${timeStr}</div>
    </div>
  `;
  msgsDiv.scrollTop = msgsDiv.scrollHeight;

  // Track clue: player engaged with mystery contact
  GameState.foundClues.push('replied_to_' + contactId);
  GameState.save();
}

function renderRadioApp() {
  const freq = RADIO_DATA.currentFrequency || 87.0;
  const isNight = GameState.timeOfDay === 'night';
  const isSpecial = Math.abs(freq - 87.9) < 0.05;

  // Get playable content
  let contentHtml = '';
  if (isNight && isSpecial) {
    const texts = RADIO_DATA.nightContent
      .filter(t => t.phase <= GameState.gamePhase)
      .map(t => t.text);
    if (texts.length > 0) {
      contentHtml = `<div class="radio-text">${texts.join('\n\n')}</div>`;
    } else {
      contentHtml = `<div class="radio-static">--- 静电噪音 ---</div>`;
    }
  } else if (isNight) {
    contentHtml = `<div class="radio-static">--- 静电噪音 ---</div>`;
  } else {
    contentHtml = `<div class="radio-static" style="color:rgba(255,255,255,0.08)">--- 无信号 ---</div>`;
  }

  // History
  let historyHtml = '';
  RADIO_DATA.listeningHistory.forEach(h => {
    historyHtml += `<div class="history-item">${h.date} ${h.time} — ${h.freq} MHz</div>`;
  });

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">电台</span>
      </div>
      <div class="radio-view">
        <div class="radio-display">
          <div class="radio-frequency">${freq.toFixed(1)}</div>
          <div class="radio-band">MHz</div>
        </div>
        <div class="radio-controls">
          <button class="radio-btn" onclick="tuneRadio(-0.5)">−</button>
          <button class="radio-btn" onclick="tuneRadio(0.5)">+</button>
        </div>
        ${isNight ? '<div class="now-playing">📻 正在播放...</div>' : '<div class="now-playing" style="color:rgba(255,255,255,0.12)">电台休息中</div>'}
        <div class="radio-content">
          ${contentHtml}
        </div>
        <div class="radio-history">
          <div class="radio-history-title">最近收听</div>
          ${historyHtml}
        </div>
      </div>
    </div>
  `;
}

function tuneRadio(delta) {
  let newFreq = parseFloat((RADIO_DATA.currentFrequency + delta).toFixed(1));
  newFreq = Math.max(RADIO_DATA.minFreq, Math.min(RADIO_DATA.maxFreq, newFreq));
  RADIO_DATA.currentFrequency = newFreq;
  renderRadioApp();
}

function renderBrowserApp() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">浏览器</span>
      </div>
      <div class="browser-view">
        <div class="browser-tabs">
          <div class="browser-tab active" onclick="showBrowserTab('history')">历史记录</div>
          <div class="browser-tab" onclick="showBrowserTab('bookmarks')">书签</div>
        </div>
        <div id="browserContent" class="browser-list">
          ${renderBrowserHistory()}
        </div>
      </div>
    </div>
  `;
}

function showBrowserTab(tab) {
  const tabs = document.querySelectorAll('.browser-tab');
  tabs.forEach((t, i) => t.classList.toggle('active', (i === 0 && tab === 'history') || (i === 1 && tab === 'bookmarks')));
  document.getElementById('browserContent').innerHTML = tab === 'history' ? renderBrowserHistory() : renderBrowserBookmarks();
}

function renderBrowserHistory() {
  let html = '';
  BROWSER_DATA.searchHistory.forEach(h => {
    html += `
      <div class="browser-item" onclick="searchWeb('${h.query}')">
        <div class="browser-item-query">${h.query}</div>
        <div class="browser-item-meta">${h.date} ${h.time}</div>
      </div>
    `;
  });
  return html || '<p style="color: rgba(255,255,255,0.3); padding: 20px; text-align: center;">无历史记录</p>';
}

function renderBrowserBookmarks() {
  let html = '';
  BROWSER_DATA.bookmarks.forEach(b => {
    html += `
      <div class="browser-bookmark" onclick="openBrowserPage('${b.id}')">
        <div class="bookmark-icon">🔖</div>
        <div>
          <div class="bookmark-title">${b.title}</div>
          <div class="bookmark-url">${b.url}</div>
        </div>
      </div>
    `;
  });
  return html || '<p style="color: rgba(255,255,255,0.3); padding: 20px; text-align: center;">无书签</p>';
}

function searchWeb(query) {
  // Show a simulated search results page
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderBrowserApp()">←</button>
        <span class="app-title">搜索</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:12px;">🔍</span>
          <div class="webpage-url">搜索: ${query}</div>
        </div>
        <div class="webpage-body" style="padding:20px 16px;">
          <p style="color: rgba(255,255,255,0.4); font-size: 11px;">找到 0 条结果</p>
          <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin-top: 16px;">搜索已被限制。</p>
        </div>
      </div>
    </div>
  `;
}

function renderGalleryApp() {
  let gridHtml = '';
  GALLERY_DATA.forEach(p => {
    const isLocked = p.locked && !GameState.unlockedContent['photo:' + p.id];
    gridHtml += `
      <div class="gallery-item ${isLocked ? 'locked' : ''}" onclick="${isLocked ? `showPasswordModal('${p.puzzleId}', '${p.id}')` : `openLightbox('${p.id}')`}">
        ${isLocked ? '' : (p.src ? `<img src="${p.src}" style="width:100%;height:100%;object-fit:cover">` : '🖼️')}
      </div>
    `;
  });

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">相册</span>
      </div>
      <div class="gallery-grid">
        ${gridHtml}
      </div>
      <div class="gallery-caption">共 ${GALLERY_DATA.length} 张照片</div>
    </div>
  `;
}

function openLightbox(photoId) {
  const photo = GALLERY_DATA.find(p => p.id === photoId);
  if (!photo) return;
  document.getElementById('screenContent').innerHTML += `
    <div class="lightbox-overlay" onclick="renderGalleryApp()">
      <button class="lightbox-close" onclick="event.stopPropagation();renderGalleryApp()">✕</button>
      <div class="lightbox-image">🖼️</div>
      <div class="lightbox-caption">${photo.caption || ''}</div>
    </div>
  `;
}

function showPasswordModal(puzzleId, photoId) {
  document.getElementById('screenContent').innerHTML += `
    <div class="password-modal">
      <p style="color:rgba(255,255,255,0.6);font-size:13px;">相册已加密</p>
      <input type="password" id="pwInput" placeholder="请输入密码" maxlength="10"
        onkeydown="if(event.key==='Enter')checkPassword('${puzzleId}', '${photoId}')">
      <button onclick="checkPassword('${puzzleId}', '${photoId}')">确定</button>
      <div id="pwError" class="pw-error"></div>
      <button style="background:none;color:rgba(255,255,255,0.4);font-size:12px;border:none;cursor:pointer;" onclick="renderGalleryApp()">取消</button>
    </div>
  `;
  setTimeout(() => document.getElementById('pwInput').focus(), 100);
}

function checkPassword(puzzleId, photoId) {
  const input = document.getElementById('pwInput').value;
  // Will be integrated with puzzle engine in Task 10
  if (input === '0520') {
    GameState.unlockedContent['photo:' + photoId] = true;
    GameState.save();
    renderGalleryApp();
  } else {
    document.getElementById('pwError').textContent = '密码错误';
  }
}

function openBrowserPage(pageId) {
  const page = BROWSER_DATA.pages[pageId];
  if (!page) return;
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderBrowserApp()">←</button>
        <span class="app-title">网页</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">${page.title}</div>
        </div>
        <div class="webpage-title">${page.title}</div>
        <div class="webpage-body">${page.content}</div>
      </div>
    </div>
  `;
}

/* ===== Notes App ===== */
function renderNotesApp() {
  let html = `<div class="app-view"><div class="app-header"><button class="back-btn" onclick="goHome()">←</button><span class="app-title">备忘录</span></div><div class="notes-list">`;
  NOTES_DATA.forEach(n => {
    const isLocked = n.locked && !GameState.unlockedContent['note:' + n.id];
    html += `
      <div class="note-item" onclick="${isLocked ? `showNotePasswordModal('${n.puzzleId}', '${n.id}')` : `openNote('${n.id}')`}">
        <div class="note-title">${n.title}</div>
        <div class="${isLocked ? 'note-locked' : 'note-text'}">${isLocked ? '🔒 已锁定' : n.text.substring(0, 40)}</div>
      </div>`;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}

function openNote(noteId) {
  const note = NOTES_DATA.find(n => n.id === noteId);
  if (!note) return;
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view"><div class="app-header"><button class="back-btn" onclick="renderNotesApp()">←</button><span class="app-title">${note.title}</span></div>
    <div class="note-detail">${note.text}</div></div>`;
}

function showNotePasswordModal(puzzleId, noteId) {
  document.getElementById('screenContent').innerHTML += `
    <div class="password-modal">
      <p style="color:rgba(255,255,255,0.6);font-size:13px;">此备忘录已加密</p>
      <input type="password" id="notePwInput" placeholder="请输入密码" maxlength="10"
        onkeydown="if(event.key==='Enter')checkNotePassword('${puzzleId}', '${noteId}')">
      <button onclick="checkNotePassword('${puzzleId}', '${noteId}')">确定</button>
      <div id="notePwError" class="pw-error"></div>
      <button style="background:none;color:rgba(255,255,255,0.4);font-size:12px;border:none;cursor:pointer;" onclick="renderNotesApp()">取消</button>
    </div>`;
}

function checkNotePassword(puzzleId, noteId) {
  const input = document.getElementById('notePwInput').value;
  if (input === '0520') {
    GameState.unlockedContent['note:' + noteId] = true;
    GameState.save();
    openNote(noteId);
  } else {
    document.getElementById('notePwError').textContent = '密码错误';
  }
}

/* ===== Call Log App ===== */
function renderPhoneApp() {
  let html = `<div class="app-view"><div class="app-header"><button class="back-btn" onclick="goHome()">←</button><span class="app-title">电话</span></div><div class="call-list">`;
  CALLLOG_DATA.forEach(c => {
    const isOut = c.type === '拨出';
    html += `<div class="call-item">
      <div class="call-icon" style="color:${isOut ? '#ff9500' : '#34c759'}">${isOut ? '📤' : '📥'}</div>
      <div class="call-info">
        <div class="call-contact">${c.contact}</div>
        <div class="call-meta">${c.date} ${c.time} · ${c.type} · ${c.duration}</div>
      </div>
    </div>`;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}

/* ===== Mail App ===== */
function renderMailApp() {
  let html = `<div class="app-view"><div class="app-header"><button class="back-btn" onclick="goHome()">←</button><span class="app-title">邮件</span></div><div class="mail-list">`;
  const visibleMails = MAIL_DATA.filter(m => m.phase <= GameState.gamePhase);
  visibleMails.forEach((m, i) => {
    html += `<div class="mail-item" onclick="openMail(${i})">
      <div class="mail-from">${m.from}</div>
      <div class="mail-subject">${m.subject}</div>
    </div>`;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}

function openMail(index) {
  const mail = MAIL_DATA[index];
  if (!mail) return;
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view"><div class="app-header"><button class="back-btn" onclick="renderMailApp()">←</button><span class="app-title">${mail.subject}</span></div>
    <div style="padding:8px 16px;font-size:11px;color:rgba(255,255,255,0.3);">${mail.from}</div>
    <div class="mail-body-view">${mail.body}</div></div>`;
}

/* ===== Snooping Tool ===== */
function renderSnoopApp() {
  const historyHtml = GameState.snoopQueries.map(q =>
    `<div class="snoop-history-item">› ${q}</div>`
  ).join('');

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">窥探器</span>
      </div>
      <div class="snoop-view">
        <div class="snoop-search-bar">
          <input type="text" class="snoop-input" id="snoopInput" placeholder="输入关键词搜索…"
            onkeydown="if(event.key==='Enter')snoopSearch()">
          <button class="snoop-btn" onclick="snoopSearch()">搜索</button>
        </div>
        <div class="snoop-progress">已发现 ${GameState.foundClues.length} 条线索</div>
        <div class="snoop-results" id="snoopResults">
          <div class="snoop-empty">输入关键词搜索姐姐手机中的数据<br>试试：87.9 / 催眠 / 电台</div>
        </div>
        ${GameState.snoopQueries.length > 0 ? `<div class="snoop-history"><div class="snoop-history-title">搜索记录</div>${historyHtml}</div>` : ''}
      </div>
    </div>
  `;
  setTimeout(() => {
    const input = document.getElementById('snoopInput');
    if (input) input.focus();
  }, 100);
}

function snoopSearch() {
  const input = document.getElementById('snoopInput');
  const query = input.value.trim();
  if (!query) return;

  GameState.snoopQueries.push(query);
  GameState.save();

  // Find matching keyword
  const match = SNOOP_KEYWORDS.find(k => k.word.toLowerCase() === query.toLowerCase());

  const resultsDiv = document.getElementById('snoopResults');

  if (!match) {
    resultsDiv.innerHTML = `<div class="snoop-result-item"><div class="snoop-result-content" style="color:rgba(255,255,255,0.3);">未找到匹配结果</div></div>`;
    return;
  }

  let html = '';
  match.results.forEach(r => {
    const extraClass = r.final ? 'final' : r.secret ? 'secret' : '';
    html += `<div class="snoop-result-item ${extraClass}">
      <div class="snoop-result-type">${r.type}</div>
      <div class="snoop-result-content">${r.content}</div>
    </div>`;
  });
  resultsDiv.innerHTML = html;

  // Track secret findings
  if (match.results.some(r => r.secret)) {
    GameState.foundClues.push('snoop_secret_' + match.word);
    GameState.save();
  }

  // Check for final trigger
  if (match.results.some(r => r.final)) {
    GameState.foundClues.push('snoop_final_trigger');
    GameState.gamePhase = 3;
    GameState.save();
    // Trigger ending sequence after a moment
    setTimeout(() => {
      if (typeof triggerEnding === 'function') {
        triggerEnding();
      }
    }, 2000);
  }

  input.value = '';
}
