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
