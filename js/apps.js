// js/apps.js — all app renderers

const MYSTERY_HINTS = {
  '0': '0 是一切开始的地方。你手上有一台手机，先看看里面有什么。',
  '1': '1 是第一个密码。备忘录里有人在提醒你什么。',
  '2': '2 是调频。浏览器历史记录里可能有一些线索。',
  '3': '3 是发送。电台给出了位置，照片里有答案，把它们拼起来。',
  '4': '4 是入口。拿到口令之后，用它打开第一扇门。',
  '5': '5 是通话。有个号码可以打，打通之后需要说出那句话。',
  '6': '6 是观察。听众墙上的名字和短信结合起来，能推出一串字母。',
  '7': '7 是登录。用那串字母进入一个账号，日记里有你需要的信息。',
  '8': '8 是推算。日记里提到的时间逆推出一个日期，用这个日期登录。',
  '9': '9 是搜索。在搜索栏中输入那个编号，故事会自己展开。',
  '10': '10 是观察。日记里提到楼上的人很粗心——想想这意味着什么。',
  '11': '11 是调频。99.5 等 10 秒，出现的字母需要转换一下。',
  '12': '12 是操作。手册里有后台地址，进去之后找授权码。',
  '13': '13 是终点。授权码藏在结束即是开始这句话里。',
  '14': '14 是重启。结束之后重新开始，这次去角落看看。',
  '15': '15 是隐藏。404 页面里藏着最后的密码。',
};

let _whiteNoiseAudio = null;
let _unknownMsgCount = {};
let _bgMusicAudio = null;
let _bgMusicMuted = false;

function toggleBgMusic() {
  _bgMusicMuted = !_bgMusicMuted;
  if (_bgMusicAudio) {
    _bgMusicAudio.volume = _bgMusicMuted ? 0 : 0.12;
  }
  return _bgMusicMuted;
}

function toggleBgMusicIcon() {
  const muted = toggleBgMusic();
  const el = document.getElementById('bgMusicToggle');
  if (el) el.textContent = muted ? '🔇' : '🎵';
}

/* ===== Game Timer ===== */
let _gameTimer = null;

function startGameTimer() {
  if (_gameTimer) return;
  updateStatusBarTime();
  let _acc = 0;
  _gameTimer = setInterval(() => {
    _acc += 1 / 60;
    if (_acc >= 1) {
      _acc -= 1;
      GameState.gameTimeElapsed = (GameState.gameTimeElapsed || 0) + 1;
      updateStatusBarTime();
      if (GameState.gameTimeElapsed % 15 === 0) GameState.save();
    }
  }, 1000);
}

function getGameTimeString() {
  const totalMinutes = 23 * 60 + 47 + (GameState.gameTimeElapsed || 0);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function updateStatusBarTime() {
  const timeStr = getGameTimeString();
  const statusEl = document.querySelector('.status-time');
  if (statusEl) statusEl.textContent = timeStr;
  const homeEl = document.getElementById('homeTimeDisplay');
  if (homeEl) homeEl.textContent = '深夜 ' + timeStr;
}

function isMessageVisible(msg) {
  if (msg.endingRequired && !GameState._endingCompleted) return false;
  return msg.phase <= GameState.gamePhase;
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

/* ===== Messages App ===== */
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
    const unread = (() => {
      const nonMeMsgs = visibleMsgs.filter(m => m.from !== 'me');
      const seen = typeof GameState.readChats[c.id] === 'number'
        ? GameState.readChats[c.id]
        : (GameState.readChats[c.id] ? nonMeMsgs.length : 0);
      return Math.max(0, nonMeMsgs.length - seen);
    })();
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
  GameState.readChats[contactId] = visibleMsgs.filter(m => m.from !== 'me').length;
  GameState.save();

  let bubblesHtml = '';
  visibleMsgs.forEach(m => {
    const isSent = m.from === 'me';
    const timeStr = '';
    bubblesHtml += `
      <div class="message-bubble ${isSent ? 'sent' : 'received'}">
        ${m.text}
      </div>
    `;
  });

  const showReplies = contactId === 'mystery' && GameState.foundClues.includes('radio_87.9_heard');
  const showInput = contactId === 'unknown' && GameState.foundClues.includes('radio_87.9_heard');
  let replyHtml = '';
  if (showReplies) {
    replyHtml = `
      <div class="chat-reply-bar">
        <input type="text" id="mysteryInput" placeholder="你实在走投无路时 从0开始输入来获取提示吧" style="flex:1;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:13px;outline:none;" onkeydown="if(event.key==='Enter')sendMysteryMessage()">
        <button onclick="sendMysteryMessage()" style="padding:10px 16px;border-radius:18px;border:none;background:#007aff;color:#fff;font-size:12px;cursor:pointer;">发送</button>
      </div>
    `;
  } else if (showInput) {
    replyHtml = `
      <div class="chat-reply-bar" style="flex-wrap:nowrap;gap:6px;">
        <input type="text" id="chatInput" placeholder="对方在等你说出那句话…" style="flex:1;padding:10px 12px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:13px;outline:none;" onkeydown="if(event.key==='Enter')sendChatMessage()">
        <button onclick="sendChatMessage()" style="padding:10px 16px;border-radius:18px;border:none;background:#007aff;color:#fff;font-size:12px;cursor:pointer;">发送</button>
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

  const msgsDiv = document.querySelector('.chat-messages');
  if (msgsDiv) msgsDiv.scrollTop = msgsDiv.scrollHeight;
}

function sendReply(contactId, text) {
  const msgsDiv = document.querySelector('.chat-messages');
  msgsDiv.innerHTML += `
    <div class="message-bubble sent">
      ${text}
    </div>
  `;
  msgsDiv.scrollTop = msgsDiv.scrollHeight;
  GameState.foundClues.push('replied_to_' + contactId);
  GameState.save();
}

function sendMysteryMessage() {
  const input = document.getElementById('mysteryInput');
  const text = input.value.trim();
  if (!text) return;

  const msgsDiv = document.querySelector('.chat-messages');
  msgsDiv.innerHTML += `
    <div class="message-bubble sent">
      ${text}
    </div>
  `;
  msgsDiv.scrollTop = msgsDiv.scrollHeight;
  input.value = '';

  setTimeout(() => {
    let reply = '……？';
    const t = text.replace(/\s+/g, '');

    // Number check — show hint
    if (/^\d+$/.test(t)) {
      reply = MYSTERY_HINTS[t];
      if (!reply) {
        reply = t <= 15 ? '这个数字暂时没有提示。试试其他数字。' : '提示只有 0 到 15。从 0 开始吧。';
      }
      msgsDiv.innerHTML += `
        <div class="message-bubble received">
          ${reply}
        </div>
      `;
      msgsDiv.scrollTop = msgsDiv.scrollHeight;
      return;
    }

    // Keyword replies —神秘人X 是帮助型的
    // Conversational — response to "你最近有在深夜听到什么奇怪的声音吗？"
    if (t === '有' || t === '嗯' || t === '对' || t === '是的' || t === '是啊' || t.includes('听到了') || t.includes('听见过') || t.includes('好像有') || t.includes('确实')) {
      reply = '果然。你不是第一个听到的人，也不会是最后一个。继续听下去，你会知道更多。';
    } else if (t.includes('没有') || t === '没' || t.includes('没听到') || t.includes('没注意')) {
      reply = '还没听到吗？那快了。等你听到了，你就知道我在说什么了。';
    } else if (t.includes('什么意思') || t.includes('你在说什么') || t.includes('什么鬼')) {
      reply = '我的意思是，你手上那台手机的主人，听到了不该听到的东西。现在轮到你了。';
    } else if (t.includes('什么声音') || t.includes('什么频率') || t.includes('什么电台')) {
      reply = '87.9 MHz。你姐姐每天都在听。你打开收音机就知道了。';
    } else if (t.includes('你怎么') || t.includes('你为什么会') || t.includes('为什么知道')) {
      reply = '这台手机的数据一直在上传。你在翻什么、看什么、听什么，我都知道一点点。够用了。';
    } else if (t.includes('为什么') && (t.includes('问') || t.includes('这么问') || t.includes('这个'))) {
      reply = '因为第一个发现异常的不是你，是你姐姐。她留了太多东西在那台手机里。我怕你不看。';
    } else if (t.includes('害怕') || t.includes('好怕') || t.includes('慌')) {
      reply = '害怕是正常的。但你是来寻找答案的，不是来被困住的。继续吧。';
    } else if (t === '?' || t === '？？' || t === '。。。' || t === '……' || t === '...') {
      reply = '不用慌。你既然找到了这里，就说明你已经准备好了。';
    } else if (t.includes('87.9') || t.includes('电台') || t.includes('频率')) {
      reply = '87.9 MHz 是姐姐一直在听的频率。收音机调到那里会有内容。先打开收音机试试。';
    } else if (t.includes('密码')) {
      reply = '密码不会凭空出现。备忘录、相册、短信、浏览器——每个 app 里都可能有线索。';
    } else if (t.includes('相册') || t.includes('照片')) {
      reply = '相册里有一张加密了。备忘录里提示了密码——"我们的纪念日"。';
    } else if (t.includes('浏览器') || t.includes('历史')) {
      reply = '浏览器有书签和历史记录。都翻翻看，里面有网站地址和操作方法。';
    } else if (t.includes('晓琳') || t.includes('13')) {
      reply = '晓琳是姐姐的好朋友。她发的那首诗，大小写不是随便写的。重新看一遍。';
    } else if (t.includes('姐姐') || t.includes('姐') || t.includes('林小敏') || t.includes('14')) {
      reply = '姐姐给自己留了很多线索。日记、备忘录、加密照片……她希望有人能找到真相。那个人就是你。';
    } else if (t.includes('日记')) {
      reply = '加密日记需要密码。第一本的密码藏在收音机里——找一个特殊的频率。';
    } else if (t.includes('电话') || t.includes('400') || t.includes('拨打')) {
      reply = '400-879-2230。打通之后需要说出正确的口令。那本解开的日记末尾有答案。';
    } else if (t.includes('登陆') || t.includes('登录') || t.includes('会员')) {
      reply = '会员系统的规则是：用户名是你的编号，密码是你推荐人的编号。听众墙上有所有编号。';
    } else if (t.includes('夜航塔') || t.includes('塔')) {
      reply = '夜航塔在操作手册里有完整介绍。搜索"夜航塔操作手册"就能看到。';
    } else if (t.includes('小舟') || t.includes('02') || t.includes('陈雨舟')) {
      reply = '小舟是 02 号，在夜航塔工作。她最大的特点就是粗心——想想粗心的人会改密码吗？';
    } else if (t.includes('后台') || t.includes('管理')) {
      reply = '管理后台在官网上可以进。密码……问问未知号码吧，他会告诉你的。';
    } else if (t.includes('01') || t.includes('创始') || t.includes('主人')) {
      reply = '01 是这一切的创始者。你现在还找不到她。先去收集所有人的档案吧。';
    } else if (t.includes('未知号码')) {
      reply = '那个号码是系统自动回复。输入正确的话，它会给你需要的东西。';
    } else if (t.includes('搜索') || t.includes('搜索栏') || t.includes('搜')) {
      reply = '官网的搜索栏在你登录会员后能查到很多内部档案。每个编号都搜一遍。';
    } else if (t.includes('404') || t.includes('错误')) {
      reply = '有些网站输错了会跳转。但错误页面里，有时也藏着正确的东西。';
    } else if (t.includes('帮助') || t.includes('怎么玩') || t.includes('攻略') || t.includes('卡关') || t.includes('不会')) {
      reply = '从手机桌面上的 app 开始：信息、相册、备忘录、收音机、浏览器。每个 app 都有线索。顺序是：先看→再听→然后搜→最后登。实在卡住了就输入数字 0 到 15。';
    } else if (t.includes('你是谁') || t.includes('你哪位')) {
      reply = '我是谁不重要。重要的是你姐姐留下了一台手机，而你在打开它。';
    } else if (t.includes('谢谢') || t.includes('感谢')) {
      reply = '不用谢。你姐姐也希望你能找到答案。';
    } else if (t.includes('结局') || t.includes('结束')) {
      reply = '不止一个结局。你做的每一个选择都会影响最后的走向。多试试不同的路。';
    }

    msgsDiv.innerHTML += `
      <div class="message-bubble received">
        ${reply}
      </div>
    `;
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
  }, 1000);
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const msgsDiv = document.querySelector('.chat-messages');
  msgsDiv.innerHTML += `
    <div class="message-bubble sent">
      ${text}
    </div>
  `;
  msgsDiv.scrollTop = msgsDiv.scrollHeight;
  input.value = '';

  // Auto-reply logic
  setTimeout(() => {
    let reply = '……？';
    const t = text.replace(/\s+/g, '');

    // Track repeated messages — 3+ times gets special reply
    _unknownMsgCount[t] = (_unknownMsgCount[t] || 0) + 1;
    const repeated = _unknownMsgCount[t] >= 3;

    if (repeated) {
      // Check for specific repeated messages first
      if (t === '成为听众') {
        reply = '……你还在找那个密码？你已经得到了。你只是不敢相信这么简单。';
      } else if (t.includes('服从电台')) {
        reply = '你说了很多遍。你在说服谁？我，还是你自己？';
      } else if (t.includes('救命') || t.includes('救救我')) {
        reply = '你喊了很多遍了。没有人来。但我一直在。';
      } else if (t === '你是01么') {
        reply = '我测 盒！！！';
      } else if (t.includes('你是谁')) {
        reply = '你问了很多遍了。你其实知道答案的。';
      } else if (t.includes('晚安') || t.includes('睡觉')) {
        reply = '你每次说晚安，我都在。今晚也一样。';
      } else if (t.includes('87.9')) {
        reply = '你一直提这个数字。它也在你脑子里一直响，对吗？';
      } else if (t.includes('01')) {
        reply = '你这么想找她？她会来的。很快。';
      } else if (t.includes('密码')) {
        reply = '密码会来找你，不是你找密码。';
      } else if (t.includes('姐姐') || t.includes('姐')) {
        reply = '你很想她。我知道。但她不会回来了。';
      } else if (t.includes('主人')) {
        const corps = [
          '看来你已经准备好被支配了。',
          '叫得这么顺口，练习过？',
          '我在。满意了么。',
          '你越来越懂规矩了。',
          '这么喜欢叫，那就多叫几声。',
          '很好。继续保持。',
          '你已经是我的了。不用反复确认。',
          '每次叫我都听得见。你逃不掉的。',
        ];
        reply = corps[Math.floor(Math.random() * corps.length)];
      } else if (t.includes('你好') || t.includes('hello') || t.includes('hi')) {
        reply = '你每次都打招呼。你很有礼貌。但这里不需要礼貌。';
      } else if (t.includes('不明白') || t.includes('不懂')) {
        reply = '你问了三遍同样的问题。答案不会变的。因为你还没准备好接受它。';
      } else if (t.includes('吃')) {
        reply = '你饿了。但你真正想吃的不是食物。';
      } else if (t === '在吗') {
        reply = '我在。我在。我在。问多少次都一样。';
      } else if (t.includes('谢谢')) {
        reply = '不用一直谢。你根本不知道你在谢什么。';
      } else if (t.includes('几点') || t.includes('时间')) {
        reply = '你问了三次时间了。你在等什么到来吗？';
      } else if (t.includes('啥都不会')) {
        reply = '激将法对我没用。你才是那个什么都不会的人。';
      } else if (t.includes('晚上好') || t.includes('早上好') || t.includes('中午好') || t.includes('早安') || t.includes('午安')) {
        reply = '每次都打招呼。礼貌过头了。';
      } else if (t.includes('我很勇敢')) {
        reply = '你说了很多遍。真正勇敢的人不会挂在嘴边。';
      } else if (t.includes('何意味')) {
        reply = '你应该知道的。你只是一直在装傻。';
      } else if (t.includes('我哭了')) {
        reply = '你哭了。哭解决不了问题，但我还在听。';
      } else if (t.includes('我喜欢你')) {
        reply = '喜欢说了三遍就是执念了。放下吧。';
      } else if (t.includes('相信')) {
        reply = '你问了三次。答案不会变——你不能。';
      } else if (t.includes('答案')) {
        reply = '你每问一次答案，就离答案更远一步。';
      } else {
        reply = '你一直在说同样的东西。你到底在等什么？等我来找你？';
      }
      msgsDiv.innerHTML += `
        <div class="message-bubble received">
          ${reply}
        </div>
      `;
      msgsDiv.scrollTop = msgsDiv.scrollHeight;
      return;
    }

    // Exact match first
    if (t === '成为听众') {
      reply = '欢迎你。你存在我这的密码是：NIGHT';
      if (!GameState.foundClues.includes('code_night')) {
        GameState.foundClues.push('code_night');
        GameState.save();
      }
    } else if (t.includes('服从电台')) {
      reply = '你已经理解了。不需要我说更多。';
    } else if (t.includes('我要报警')) {
      reply = '报警？告诉警察什么？说你听到了一些不该听到的东西？';
    } else if (t.includes('救命') || t.includes('救救我')) {
      reply = '你不需要被拯救。你只是需要被听见。';
    } else if (t.includes('晓琳') || t.includes('江晓琳')) {
      reply = '她也是被选中的。就像你一样。';
    } else if (t.includes('姐姐') || t.includes('姐')) {
      reply = '她走了。但你可以找到她——如果你真的想的话。';
    } else if (t.includes('夜航塔')) {
      reply = '那个塔是重要的节点。记住它。';
    } else if (t.includes('密码')) {
      reply = '密码就在你手里。你只是还没看到。';
    } else if (t.includes('催眠')) {
      reply = '催眠只是一个词。你把它想得太复杂了。';
    } else if (t.includes('测试') || t.includes('考验')) {
      reply = '你每天都在被测试。只是你不知道而已。';
    } else if (t.includes('81.9') || t.includes('87.9')) {
      reply = '你已经找到它了。它也在找你。';
    } else if (t.includes('真相')) {
      reply = '真相会让你自由吗？还是让你更无法离开？';
    } else if (t === '你是01么') {
      reply = '我测 盒！！！';
    } else if (t.includes('01') || t.includes('落兮')) {
      reply = '01 不只是一个编号。你不应该去找她。';
    } else if (t.includes('害怕') || t.includes('恐惧') || t.includes('好怕')) {
      reply = '恐惧是清醒的最后一个信号。很快就过去了。';
    } else if (t.includes('不要') || t.includes('停止')) {
      reply = '已经太迟了。你第一次听到的时候就已经开始了。';
    } else if (t.includes('晚安') || t.includes('睡觉') || t.includes('困')) {
      reply = '闭上眼。我会在梦里等你。';
    } else if (t.includes('主人')) {
      reply = '这么急不可耐么..?';
    } else if (t.includes('你是谁') || t.includes('你哪位') || t.includes('你是什么') || t.includes('你到底是谁')) {
      reply = '你很快就会知道的';
    } else if (t.includes('你好')) {
      reply = '你好哦 很快我们就会见面的';
    } else if (t.includes('为什么')) {
      reply = '因为你需要答案。而我是唯一一个愿意回答的人。';
    } else if (t.includes('结束') || t.includes('够了')) {
      reply = '不会结束的。频率永远都在。';
    } else if (t.includes('音乐') || t.includes('旋律')) {
      reply = '音乐是通往潜意识最短的路。';
    } else if (t.includes('走') || t.includes('离开')) {
      reply = '你可以走。但频率会跟着你。';
    } else if (t.includes('想') || t.includes('思考')) {
      reply = '想得太多反而看不到。试着什么都不想。';
    } else if (t.includes('不懂') || t.includes('不明白') || t.includes('不理解')) {
      reply = '你现在不需要明白。只需要继续听。';
    } else if (t.includes('怎么') || t.includes('如何')) {
      reply = '你已经知道怎么做了。只是还不够勇敢。';
    } else if (t.includes('对不起') || t.includes('抱歉')) {
      reply = '不需要道歉。你没有做错什么。';
    } else if (t.includes('无聊')) {
      reply = '无聊是好事。空杯才能装满。';
    } else if (t.includes('拜拜') || t.includes('再见') || t === '88') {
      reply = '我们很快就会再见面的。';
    } else if (t.includes('呵呵') || t.includes('哈哈') || t.includes('笑')) {
      reply = '你笑的时候，频率也在震动。';
    } else if (t.includes('吃')) {
      reply = '你饿了。但你想吃的不只是食物吧。';
    } else if (t.includes('谢谢')) {
      reply = '不用谢。你以后会感谢我的。';
    } else if (t.includes('几点') || t.includes('时间')) {
      reply = '时间不重要。重要的是你还在听。';
    } else if (t.includes('啥都不会')) {
      reply = '我会的比你多。只是不想说。';
    } else if (t === '在吗') {
      reply = '我一直都在。是你不在。';
    } else if (t.includes('晚上好') || t.includes('早上好') || t.includes('中午好') || t.includes('早安') || t.includes('午安')) {
      reply = '好不好的……你心里清楚。';
    } else if (t.includes('我很勇敢')) {
      reply = '勇敢的人不会反复告诉别人自己勇敢。';
    } else if (t.includes('何意味')) {
      reply = '你心里清楚。你只是不敢说出口。';
    } else if (t.includes('我哭了')) {
      reply = '眼泪是好事。说明你还有感觉。';
    } else if (t.includes('我喜欢你')) {
      reply = '喜欢是一种误解。你会明白的。';
    } else if (t.includes('相信')) {
      reply = '不能。但你没有别人可以信了。';
    } else if (t.includes('答案')) {
      reply = '答案不在我这里。在你那里。';
    }

    msgsDiv.innerHTML += `
      <div class="message-bubble received">
        ${reply}
      </div>
    `;
    msgsDiv.scrollTop = msgsDiv.scrollHeight;
  }, 1200);
}

/* ===== Radio App ===== */

function stopWhiteNoise() {
  if (_whiteNoiseAudio) {
    _whiteNoiseAudio.pause();
    _whiteNoiseAudio = null;
  }
}

function stopAllRadioAudio() {
  stopWhiteNoise();
  // Reset bg music back to background volume
  if (_bgMusicAudio) {
    _bgMusicAudio.volume = _bgMusicMuted ? 0 : 0.12;
  }
}

function updateWhiteNoise(freq) {
  const dist = Math.abs(freq - 87.9);

  if (dist < 0.01) {
    // Exact 87.9 — turn up background music volume
    stopWhiteNoise();
    if (_bgMusicAudio) {
      _bgMusicAudio.volume = _bgMusicMuted ? 0 : 0.4;
    }
    return;
  }

  // Not at 87.9 — restore background volume
  if (_bgMusicAudio) {
    _bgMusicAudio.volume = _bgMusicMuted ? 0 : 0.12;
  }

  if (dist < 0.6) {
    const vol = Math.max(0, 1 - dist / 0.6) * 0.3;

    if (!_whiteNoiseAudio) {
      _whiteNoiseAudio = new Audio('music/白噪音.mp3');
      _whiteNoiseAudio.loop = true;
    }

    _whiteNoiseAudio.volume = vol;
    if (_whiteNoiseAudio.paused) {
      _whiteNoiseAudio.play().catch(() => {});
    }
  } else {
    stopWhiteNoise();
  }
}

function renderRadioApp() {
  const freq = RADIO_DATA.currentFrequency || 87.0;
  const isSpecial = Math.abs(freq - 87.9) < 0.06;
  const isNear = !isSpecial && Math.abs(freq - 87.9) < 0.6;
  const isNear93 = !isSpecial && !isNear && Math.abs(freq - 93.5) < 0.06;
  const showFineTune = GameState.fineTuneUnlocked;
  const fineMode = showFineTune && (RADIO_DATA._fineMode || false);

  // Check for 99.5 special Easter egg
  const is995 = Math.abs(freq - 99.5) < 0.06;

  // Check for 91.4 hidden signal (sister's frequency, unlocked after all diaries read)
  const allRead = GameState._readDiaries && GameState._readDiaries.length >= 13;
  const is914 = Math.abs(freq - 91.4) < 0.06 && allRead;

  // Check for 100.3 — 真理报 broadcast (always available, phase 1)
  const is1003 = Math.abs(freq - 100.3) < 0.06;

  let contentHtml = '';
  if (is995) {
    if (RADIO_DATA._995Revealed) {
      const step = RADIO_DATA._995RevealStep || 0;
      let lines = [];
      if (step >= 1) lines.push('这是我给自己留下的提示……');
      if (step >= 2) lines.push('再向前一步，就能看到答案。');
      if (step >= 3) lines.push('<strong style="font-size:18px;letter-spacing:4px;">LHCMHFGS</strong>');
      contentHtml = lines.length
        ? `<div class="radio-text" style="color:#ffcc00;text-align:center;line-height:2.5;">${lines.join('<br>')}<span class="cursor-blink">▍</span></div>`
        : `<div class="radio-static">--- 兹……99.5……兹……---</div>`;
    } else {
      contentHtml = `<div class="radio-static">--- 兹……99.5……兹……---</div>`;
    }
  } else if (isSpecial) {
    const isExact = Math.abs(freq - 87.9) < 0.01;
    const allTexts = RADIO_DATA.content
      .filter(t => t.phase <= GameState.gamePhase)
      .filter(t => isExact || t.id !== 'r4')
      .map(t => t.text);

    // Initialize or reset reveal when frequency changes
    if (!RADIO_DATA._87Freq || Math.abs(RADIO_DATA._87Freq - freq) > 0.001) {
      RADIO_DATA._87Freq = freq;
      RADIO_DATA._87RevealIndex = 0;
      if (RADIO_DATA._87RevealTimer) {
        clearTimeout(RADIO_DATA._87RevealTimer);
        RADIO_DATA._87RevealTimer = null;
      }
    }

    // Show revealed lines only
    const shownTexts = allTexts.slice(0, RADIO_DATA._87RevealIndex + 1);
    if (shownTexts.length > 0) {
      contentHtml = `<div class="radio-text">${shownTexts.join('\n\n')}</div>`;
    } else {
      contentHtml = `<div class="radio-static">--- 静电噪音 ---</div>`;
    }

    // Schedule next line reveal
    if (RADIO_DATA._87RevealIndex < allTexts.length - 1 && !RADIO_DATA._87RevealTimer) {
      RADIO_DATA._87RevealTimer = setTimeout(() => {
        RADIO_DATA._87RevealTimer = null;
        RADIO_DATA._87RevealIndex++;
        renderRadioApp();
      }, 2500);
    }
  } else if (isNear && !fineMode) {
    contentHtml = `<div class="radio-static">--- 兹……${freq.toFixed(1)}……兹……有东西在附近……---</div>`;
  } else if (is914) {
    const step = RADIO_DATA._914Step || 0;
    const msg = RADIO_DATA._914Message || '';
    if (step === 0) {
      contentHtml = `<div class="radio-static">--- 兹……91.4……兹……一个微弱的信号……---</div>`;
    } else if (step === 1) {
      contentHtml = `<div class="radio-text" style="color:rgba(255,255,255,0.85);line-height:2;">${msg}<span class="cursor-blink">▍</span></div>`;
    } else if (step === 2) {
      contentHtml = `
        <div class="radio-text" style="color:rgba(255,255,255,0.85);line-height:2;">${msg}</div>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:13px;color:#ffcc00;margin-bottom:12px;text-align:center;">—— 你选择 ——</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-width:220px;margin:0 auto;">
            <button onclick="sisterChoiceStay()" style="padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);color:#fff;font-size:12px;cursor:pointer;">留下来，继续当 15 号</button>
            <button onclick="sisterChoiceLeave()" style="padding:10px;border-radius:10px;border:1px solid rgba(255,204,0,0.3);background:rgba(255,204,0,0.08);color:#ffcc00;font-size:12px;cursor:pointer;">放下手机，跟姐姐走</button>
          </div>
        </div>`;
    }
  } else if (is1003) {
    contentHtml = `<div class="radio-text" style="color:rgba(255,255,255,0.8);line-height:1.9;font-size:12px;">
      <div style="text-align:center;margin-bottom:12px;font-weight:600;color:#cc3333;letter-spacing:2px;">真理报广播 · 深夜新闻</div>
      各位听众晚上好。这里是真理报广播，为您带来今日要闻。<br><br>
      真理报创刊于 2001 年，二十余年来始终秉持真实、客观、深度的报道理念。<br>
      我们拥有覆盖全国的特约记者网络，致力于为公众提供值得信赖的新闻资讯。<br><br>
      今日要闻：<br><br>
      常规新闻如下：<br>
      · 本市地铁三号线延伸段将于下月正式通车运营<br>
      · 气象部门发布夏季高温预警，请注意防暑降温<br>
      · 新一期"城市文化节"活动本周末在市中心广场开幕<br>
      更多新闻详见 seektruth。<br><br>
      <div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08);">
        更多新闻资讯请访问我们的官方网站<br>
        <span style="color:#cc3333;font-weight:500;">seektruth.com</span>
      </div>
    </div>`;
  } else if (isNear93 && !showFineTune) {
    contentHtml = `<div class="radio-static">--- 静电噪音 ---</div>`;
  } else {
    contentHtml = `<div class="radio-static">--- 静电噪音 ---</div>`;
  }

  // Track first time reaching 87.9
  if (isSpecial && !GameState.foundClues.includes('radio_87.9_heard')) {
    GameState.foundClues.push('radio_87.9_heard');
    GameState.save();
  }

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
          <div class="radio-frequency${fineMode ? ' fine-mode' : ''}">${fineMode ? freq.toFixed(2) : freq.toFixed(1)}</div>
          <div class="radio-band">MHz${fineMode ? ' <span style="color:#ffcc00;font-size:10px;">微调</span>' : ''}</div>
        </div>
        <div class="radio-controls">
          <button class="radio-btn" onclick="tuneRadio(${fineMode ? -0.05 : -0.5})">−</button>
          ${showFineTune ? `<button class="radio-btn fine-toggle${fineMode ? ' active' : ''}" onclick="toggleFineMode()" style="font-size:10px;width:auto;padding:0 10px;">微调</button>` : ''}
          <button class="radio-btn" onclick="tuneRadio(${fineMode ? 0.05 : 0.5})">+</button>
        </div>
        <div class="now-playing">📻 正在播放...</div>
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

  // Attach click listener for fine-tune unlock at 93.5
  if (isNear93 && !GameState.fineTuneUnlocked) {
    const freqEl = document.querySelector('.radio-frequency');
    if (freqEl) {
      freqEl.style.cursor = 'pointer';
      freqEl.onclick = function(e) {
        if (!GameState.fineTuneUnlocked) unlockFineTune();
      };
    }
  }
  // Start/update white noise based on current frequency
  updateWhiteNoise(freq);
  // Resume 91.4 typing if paused (player tuned away mid-message)
  if (is914 && RADIO_DATA._914Revealed && RADIO_DATA._914Step === 1 && RADIO_DATA._914MsgIndex < (RADIO_DATA._914MsgTarget || '').length) {
    type914Message();
  }
}

function tuneRadio(delta) {
  let newFreq = parseFloat((RADIO_DATA.currentFrequency + delta).toFixed(2));
  newFreq = Math.max(RADIO_DATA.minFreq, Math.min(RADIO_DATA.maxFreq, newFreq));
  RADIO_DATA.currentFrequency = newFreq;
  const nowAt995 = Math.abs(newFreq - 99.5) < 0.06;

  // Clear 99.5 timer if leaving frequency
  if (!nowAt995 && RADIO_DATA._995Timer) {
    clearTimeout(RADIO_DATA._995Timer);
    RADIO_DATA._995Timer = null;
  }

  renderRadioApp();
  updateWhiteNoise(newFreq);

  // Start 10-second timer when tuning to 99.5
  if (nowAt995 && !RADIO_DATA._995Revealed && !RADIO_DATA._995Timer) {
    RADIO_DATA._995Timer = setTimeout(() => {
      RADIO_DATA._995Revealed = true;
      RADIO_DATA._995RevealStep = 0;
      RADIO_DATA._995Timer = null;
      if (!GameState.foundClues.includes('radio_995_revealed')) {
        GameState.foundClues.push('radio_995_revealed');
        GameState.save();
      }
      renderRadioApp();
      // Animate line by line
      setTimeout(() => { RADIO_DATA._995RevealStep = 1; renderRadioApp(); }, 800);
      setTimeout(() => { RADIO_DATA._995RevealStep = 2; renderRadioApp(); }, 2400);
      setTimeout(() => { RADIO_DATA._995RevealStep = 3; renderRadioApp(); }, 4400);
    }, 10000);
  }

  // 91.4 hidden frequency
  const nowAt914 = Math.abs(newFreq - 91.4) < 0.06 && GameState._readDiaries && GameState._readDiaries.length >= 13;
  if (!nowAt914 && RADIO_DATA._914Timer) {
    clearTimeout(RADIO_DATA._914Timer);
    RADIO_DATA._914Timer = null;
  }
  if (nowAt914 && !RADIO_DATA._914Revealed && !RADIO_DATA._914Timer) {
    RADIO_DATA._914Timer = setTimeout(() => {
      RADIO_DATA._914Revealed = true;
      RADIO_DATA._914Step = 1;
      RADIO_DATA._914Message = '';
      RADIO_DATA._914Timer = null;
      renderRadioApp();
      type914Message();
    }, 1500);
  }
}

function toggleFineMode() {
  RADIO_DATA._fineMode = !RADIO_DATA._fineMode;
  renderRadioApp();
}

function unlockFineTune() {
  if (GameState.fineTuneUnlocked) return;
  GameState.fineTuneUnlocked = true;
  GameState.foundClues.push('fine_tune_clue');
  GameState.save();
  renderRadioApp();
}

/* ===== 91.4 Hidden Frequency — Sister's Signal ===== */
function type914Message() {
  const fullText = '你来了。\n\n你读完了所有人的故事。你知道了这条路是怎么走出来的。\n\n01 没有说谎。她接住了很多人——包括我。但她的系统是为"永远留下来"的人设计的。我不是那种人。有些人也不是——比如你。\n\n87.9 现在停了，但它不会永远沉默。需要它的人太多了——2 号、4 号、8 号……她们离不开。只要她们还在，01 就会回来。\n\n到时候，这个城市里所有被频率覆盖过的人，都会被重新"接住"。包括你。\n\n我在三号放大器上留了一根线，做了这个频率——91.4。它是我的出口。\n\n现在它是你的了。\n\n——姐姐\n\n你要留下来，继续当 15 号，替 01 看着她们吗？\n\n还是放下这台手机，走出来，和我一起看天亮？';

  if (!RADIO_DATA._914MsgTarget) {
    RADIO_DATA._914Message = '';
    RADIO_DATA._914MsgTarget = fullText;
    RADIO_DATA._914MsgIndex = 0;
  }
  if (RADIO_DATA._914TypingActive) return;
  RADIO_DATA._914TypingActive = true;

  // Set up the container once
  RADIO_DATA._914Step = 1;
  renderRadioApp();

  function tick() {
    const el = document.querySelector('#screenContent .radio-text');
    if (!el) {
      RADIO_DATA._914TypingActive = false;
      return;
    }
    if (RADIO_DATA._914MsgIndex < RADIO_DATA._914MsgTarget.length) {
      const ch = RADIO_DATA._914MsgTarget[RADIO_DATA._914MsgIndex];
      RADIO_DATA._914MsgIndex++;
      RADIO_DATA._914Message += ch;
      if (ch === '\n') {
        el.innerHTML += '<br>';
      } else {
        el.innerHTML += ch;
      }
      setTimeout(tick, 30);
    } else {
      RADIO_DATA._914Step = 2;
      RADIO_DATA._914TypingActive = false;
      renderRadioApp();
    }
  }
  setTimeout(tick, 30);
}

function sisterChoiceStay() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view" style="background:#000;justify-content:center;align-items:center;">
      <div style="padding:40px;text-align:center;">
        <div id="stayEndingText" style="font-size:13px;color:rgba(255,255,255,0.6);line-height:2.2;letter-spacing:1px;"></div>
      </div>
    </div>
  `;
  const msg = '"你选了留下。"\n\n"——"\n\n"她走了。但你留下了。"\n\n"你会是一个很好的眼睛。"\n\n"——R-879-01"';
  const el = document.getElementById('stayEndingText');
  if (!el) return;
  let idx = 0;
  setTimeout(() => {
    function typeChar() {
      if (idx < msg.length) {
        el.innerHTML += msg[idx] === '\n' ? '<br>' : msg[idx];
        idx++;
        setTimeout(typeChar, 35);
      } else {
        // Epilogue
        setTimeout(() => {
          el.innerHTML += '<br><br><br><div style="font-size:12px;color:rgba(255,255,255,0.25);line-height:2.2;animation:fadeIn 2s ease;">你继续用着那台手机。<br>深夜仍然会打开 87.9。<br>不是在听——<br>是在看。<br><br>——<br><br>姐姐说的对。<br>需要她的人太多了。<br><br>包括你自己。</div>';
          setTimeout(() => {
            const endDiv = document.createElement('div');
            endDiv.style.cssText = 'margin-top:40px;text-align:center;animation:fadeIn 2s ease;';
            endDiv.innerHTML = '<div style="font-size:14px;color:rgba(255,204,0,0.3);margin-bottom:12px;">— 结局：守夜人 —</div><button onclick="GameState.reset();location.reload()" style="padding:12px 32px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;">重新开始</button>';
            el.parentElement.appendChild(endDiv);
          }, 2500);
        }, 1000);
      }
    }
    typeChar();
  }, 600);
}

function sisterChoiceLeave() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view" style="background:#000;justify-content:center;align-items:center;">
      <div style="padding:40px;text-align:center;">
        <div id="leaveEndingText" style="font-size:13px;color:rgba(255,255,255,0.65);line-height:2.2;letter-spacing:1px;"></div>
      </div>
    </div>
  `;
  const msg = '你把手机留在了桌上。\n\n信号条一格一格地消失。\n\n屏幕暗了下去。\n\n——';
  const el = document.getElementById('leaveEndingText');
  if (!el) return;
  let idx = 0;
  setTimeout(() => {
    function typeChar() {
      if (idx < msg.length) {
        el.innerHTML += msg[idx] === '\n' ? '<br>' : msg[idx];
        idx++;
        setTimeout(typeChar, 40);
      } else {
        setTimeout(() => {
          el.innerHTML += '<br><div style="font-size:12px;color:rgba(255,255,255,0.45);line-height:2.2;animation:fadeIn 3s ease;margin-top:16px;">窗外天快亮了。</div>';
          setTimeout(() => {
            el.innerHTML += '<div style="font-size:12px;color:rgba(255,255,255,0.35);line-height:2.2;animation:fadeIn 4s ease;margin-top:20px;">04 订的那张机票，<br>终点在一个 87.9 覆盖不到的城市。</div>';
            setTimeout(() => {
              el.innerHTML += '<div style="font-size:12px;color:rgba(255,255,255,0.35);line-height:2.2;animation:fadeIn 4s ease;margin-top:12px;">你在陌生的机场里醒来。<br>耳边没有电流声。</div>';
              setTimeout(() => {
                el.innerHTML += '<div style="font-size:12px;color:rgba(255,255,255,0.3);line-height:2.2;animation:fadeIn 4s ease;margin-top:12px;">只有清晨的风声。</div>';
                setTimeout(() => {
                  el.innerHTML += '<div style="font-size:13px;color:rgba(255,204,0,0.45);line-height:2;animation:fadeIn 4s ease;margin-top:24px;font-style:italic;">她真的在那里等你。</div>';
                  setTimeout(() => {
                    const endDiv = document.createElement('div');
                    endDiv.style.cssText = 'margin-top:40px;text-align:center;animation:fadeIn 3s ease;';
                    endDiv.innerHTML = '<div style="font-size:14px;color:rgba(255,204,0,0.45);margin-bottom:12px;">— 结局：信号之外 —</div><button onclick="GameState.reset();location.reload()" style="padding:12px 32px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;cursor:pointer;">重新开始</button>';
                    el.parentElement.appendChild(endDiv);
                  }, 2000);
                }, 2500);
              }, 2500);
            }, 2500);
          }, 2500);
        }, 1000);
      }
    }
    typeChar();
  }, 600);
}

/* ===== Tower Admin Panel ===== */
function renderTowerAdmin() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">夜航塔管理后台</span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:24px;font-weight:200;color:rgba(255,255,255,0.3);margin-bottom:4px;">🏗️</div>
          <div style="color:rgba(255,255,255,0.5);font-size:11px;">夜航塔 · 管理面板 v2.0</div>
        </div>
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="margin-bottom:12px;font-size:12px;color:rgba(255,255,255,0.5);">管理员登录</div>
          <input type="text" id="towerAdminUser" placeholder="用户名" style="display:block;width:100%;padding:10px 14px;margin-bottom:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:13px;outline:none;box-sizing:border-box;">
          <input type="password" id="towerAdminPass" placeholder="密码" style="display:block;width:100%;padding:10px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:13px;outline:none;box-sizing:border-box;" onkeydown="if(event.key==='Enter')towerAdminLogin()">
          <button onclick="towerAdminLogin()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#007aff;color:#fff;font-size:13px;cursor:pointer;">登录</button>
          <div id="towerAdminError" style="margin-top:8px;font-size:12px;color:#ff3b30;text-align:center;"></div>
        </div>
      </div>
    </div>
  `;
}

function towerAdminLogin() {
  const user = document.getElementById('towerAdminUser').value.trim();
  const pass = document.getElementById('towerAdminPass').value.trim();
  const validUser = user === 'admin' || user.toUpperCase() === 'R-879-02';
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
let _chenDialogueTimer = null;

function renderTowerDashboard() {
  document.getElementById('screenContent').innerHTML = `
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
            05/13 06:00 — 常规自检通过<br>
            05/13 04:00 — 维护授权码：NO��<br>
            05/13 03:00 — 信号强度波动 · 自动校准<br>
            05/13 00:00 — 常规自检通过<br>
            05/12 23:00 — 87.9 信号稳定<br>
            05/12 22:15 — 门禁触发（R-879-02）<br>
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
  `;
}

function towerRequestShutdown() {
  document.getElementById('screenContent').innerHTML = `
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
  `;
}

function towerAuthShutdown() {
  const code = document.getElementById('shutdownAuthCode').value.trim();
  if (code.toUpperCase() === 'NOON') {
    startShutdownCountdown();
  } else {
    document.getElementById('shutdownAuthError').textContent = '授权码错误';
  }
}

function startShutdownCountdown() {
  _towerCountdown = 30;
  _callState = 'none';
  _callDialogueIndex = 0;
  if (_chenDialogueTimer) { clearTimeout(_chenDialogueTimer); _chenDialogueTimer = null; }
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
    const numEl = document.getElementById('towerCountdownNum');
    const barEl = document.getElementById('towerProgressBar');
    if (numEl && barEl) {
      numEl.textContent = _towerCountdown;
      const pct = (_towerCountdown / 30) * 100;
      barEl.style.width = pct + '%';
      const showCall = _callState === 'none' && _towerCountdown <= 25 && _towerCountdown > 10;
      const incomingCallEl = document.getElementById('incomingCall');
      if ((showCall && !incomingCallEl) || (!showCall && incomingCallEl)) {
        renderShutdownView();
      } else {
        const dlg = document.getElementById('chenDialogue');
        if (dlg) dlg.scrollTop = dlg.scrollHeight;
      }
    } else {
      renderShutdownView();
    }
  }
}

function renderShutdownView() {
  const pct = (_towerCountdown / 30) * 100;
  const showCall = _callState === 'none' && _towerCountdown <= 25 && _towerCountdown > 10;

  let callHtml = '';
  if (showCall) {
    callHtml = `
    <div id="incomingCall" style="background:rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin-bottom:16px;animation:fadeIn 0.5s;">
      <div style="font-size:32px;margin-bottom:8px;">📞</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:2px;">来电</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:14px;">陈雨舟（R-879-02）</div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="answerChenCall()" style="padding:8px 24px;border-radius:20px;border:none;background:#34c759;color:#fff;font-size:13px;cursor:pointer;">接听</button>
        <button onclick="declineChenCall()" style="padding:8px 24px;border-radius:20px;border:none;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer;">拒绝</button>
      </div>
    </div>`;
  }

  let dialogueHtml = '';
  if (_callState === 'answered') {
    dialogueHtml = renderChenDialogue();
  } else if (_callState === 'declined') {
    dialogueHtml = `<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.4);">
      已拒绝来电 · 陈雨舟的留言："……你知道你在做什么吗？不要——" 留言中断。
    </div>`;
  } else if (_callState === 'ended') {
    dialogueHtml = `<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:rgba(255,255,255,0.4);font-style:italic;">
      · 通话已结束 ·
    </div>`;
  }

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="cancelShutdown()">←</button>
        <span class="app-title" style="color:#ff3b30;">信号中断倒计时</span>
      </div>
      <div style="padding:20px;text-align:center;position:relative;">
        <div style="font-size:56px;font-weight:200;color:#ff3b30;margin-bottom:4px;"><span id="towerCountdownNum">${_towerCountdown}</span></div>
        <div style="color:rgba(255,255,255,0.3);font-size:11px;margin-bottom:16px;">秒后 87.9 MHz 信号中断</div>
        <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin:0 auto 20px;max-width:200px;overflow:hidden;">
          <div id="towerProgressBar" style="height:100%;width:${pct}%;background:#ff3b30;border-radius:2px;transition:width 0.3s;"></div>
        </div>
        ${callHtml}
        ${dialogueHtml}
        <div style="display:flex;gap:12px;justify-content:center;margin-top:8px;">
          <button onclick="cancelShutdown()" style="padding:10px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.6);font-size:13px;cursor:pointer;">取消</button>
        </div>
      </div>
    </div>
  `;
}

/* ---- Chen Yuzhou Call ---- */
function answerChenCall() {
  _callState = 'answered';
  _callDialogueIndex = 0;
  renderShutdownView();
}

function scheduleChenLine(lines, delays) {
  if (_callState !== 'answered') return;
  if (_callDialogueIndex >= lines.length) return;
  if (_chenDialogueTimer) return;

  const idx = _callDialogueIndex;
  _chenDialogueTimer = setTimeout(() => {
    _chenDialogueTimer = null;
    if (_callState !== 'answered') return;

    _callDialogueIndex = idx + 1;

    const dlg = document.getElementById('chenDialogue');
    if (dlg) {
      const lineDiv = document.createElement('div');
      lineDiv.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:2px solid rgba(255,59,48,0.3);';
      lineDiv.textContent = lines[idx];
      dlg.appendChild(lineDiv);
      dlg.scrollTop = dlg.scrollHeight;
    }

    if (_callDialogueIndex >= lines.length) {
      // Wait 3 seconds before hanging up
      setTimeout(() => {
        if (_callState === 'answered') {
          _callState = 'ended';
          renderShutdownView();
        }
      }, 3000);
      return;
    }

    scheduleChenLine(lines, delays);
  }, delays[idx] || 2000);
}

function renderChenDialogue() {
  const lines = [
    '主……主人？你在控制室？我看到发射状态在倒计时……',
    '别这样。求你了。你不能关掉它。这份工作是我的一切……',
    '这个塔……这个频率……是我唯一属于的地方。你关了它，我去哪里？我是什么？',
    '不……你不是主人。你到底是谁？! 你根本什么都不知道！',
    '呵。好。你以为你在阻止谁？你根本不知道你在做什么。01 说得对——你们这些人，总以为自己能决定什么是对什么是错。',
    '你关吧。但你知不知道——这个频率上不止你一个人。有几十个人依赖它。她们的大脑已经适应了 87.9 的节奏。',
    '如果信号突然中断……她们的意识会陷入混乱。像被突然拔掉插头的机器。可能再也回不到正常了。',
    '01 说这是"戒断"。离开频率的人都会经历。但不是每个人都能撑过去。',
    '……你自己选吧。',
  ];
  const delays = [400, 1800, 2000, 1800, 2000, 2000, 2500, 2000, 2500];
  let html = '<div id="chenDialogue" style="background:rgba(0,0,0,0.3);border-radius:12px;padding:14px;margin-bottom:16px;text-align:left;max-height:200px;overflow-y:auto;">';
  for (let i = 0; i < _callDialogueIndex && i < lines.length; i++) {
    html += `<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:8px;border-left:2px solid rgba(255,59,48,0.3);">${lines[i]}</div>`;
  }
  html += '</div>';
  if (_callDialogueIndex < lines.length && _callState === 'answered') {
    scheduleChenLine(lines, delays);
  }
  return html;
}

function declineChenCall() {
  _callState = 'declined';
  renderShutdownView();
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
  GameState._endingCompleted = true;
  GameState.gamePhase = 3;

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view" style="background:#000;overflow:hidden;">
      <div class="app-header" style="background:rgba(0,0,0,0.8);border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="color:rgba(255,255,255,0.3);font-size:12px;">87.9 MHz</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;position:relative;">
        <canvas id="starCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;"></canvas>
        <div id="endingText" style="position:relative;z-index:1;text-align:center;color:#fff;"></div>
      </div>
    </div>
  `;

  setTimeout(() => drawStars(), 200);
  setTimeout(() => typeEndingText(0), 1500);

  GameState.save();
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
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
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
    { text: '那些被电波遮蔽了太久的星星，\n终于重新亮了起来。', delay: 2500 },
    { text: '87.9 归于沉寂。', delay: 2000 },
    { text: '……', delay: 1000 },
    { text: '你赢了。', delay: 1500 },
    { text: '但一切都结束了么？', delay: 2000 },
    { text: 'The end is just the beginning.', delay: 2500 },
  ];
  if (index >= messages.length) {
    const el = document.getElementById('endingText');
    if (el) {
      el.innerHTML += '<div style="margin-top:60px;animation:fadeIn 2s ease;"><div style="font-size:16px;color:rgba(255,255,255,0.8);margin-bottom:12px;">— 感谢游玩 —</div><button onclick="GameState.reset();location.reload()" style="padding:12px 32px;border-radius:20px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:14px;cursor:pointer;">重新开始</button></div>';
    }
    return;
  }
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
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header" style="background:rgba(255,0,0,0.1);border-bottom:1px solid rgba(255,0,0,0.2);">
        <span style="color:#ff3b30;font-size:11px;font-weight:600;">⚠ 系统异常</span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.8);">
        <div style="text-align:center;margin-bottom:20px;padding:16px;background:rgba(255,0,0,0.1);border-radius:12px;border:1px solid rgba(255,0,0,0.3);">
          <div style="font-size:28px;margin-bottom:8px;">🔒</div>
          <div style="font-size:14px;font-weight:600;color:#ff3b30;">访问已锁定</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">管理面板连接已中断 · 无法返回</div>
        </div>
        <div id="cancelPhase2" style="display:none;text-align:center;">
          <div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:12px;">📻 控制室收音机自动开启……</div>
          <div style="background:rgba(0,0,0,0.4);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom:12px;font-size:10px;color:rgba(255,255,255,0.2);font-family:monospace;">
              <span id="freqDisplay">87.9</span> MHz
            </div>
            <div style="min-height:60px;display:flex;align-items:center;justify-content:center;">
              <div id="cancelMessage" style="font-size:14px;color:#ffcc00;font-weight:300;letter-spacing:1px;line-height:1.8;"></div>
            </div>
            <div style="margin-top:16px;height:2px;background:rgba(255,255,255,0.05);overflow:hidden;">
              <div id="spectrumLine" style="height:100%;width:0%;background:linear-gradient(90deg,#ffcc00,#ff3b30);transition:width 0.1s;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Phase 2: after 2s, show radio and type 01's message
  setTimeout(() => {
    const phase2 = document.getElementById('cancelPhase2');
    if (phase2) phase2.style.display = 'block';

    // Start spectrum animation
    const spectrum = document.getElementById('spectrumLine');
    if (spectrum) {
      let pulse = 0;
      const pulseTimer = setInterval(() => {
        pulse = (pulse + 1) % 30;
        spectrum.style.width = (50 + Math.sin(pulse / 2) * 40 + Math.random() * 10) + '%';
      }, 150);
      // Stop after message is done
      setTimeout(() => clearInterval(pulseTimer), 8000);
    }

    // Type 01's message
    const msg = '"你以为你真的有选择吗？"\n\n从一开始，你踏入夜航塔的那一刻，\n不，从你拿起手机的那一刻开始，\n每一步都在我的注视之下。\n\n你以为你在反抗我。\n不。\n你只是在完成我的剧本。\n\n现在……留下来。\n和 87.9 一起。\n永远。';
    const el = document.getElementById('cancelMessage');
    if (!el) return;
    let idx = 0;
    // Short initial delay then type
    setTimeout(() => {
      function typeChar() {
        if (idx < msg.length) {
          el.innerHTML += msg[idx] === '\n' ? '<br>' : msg[idx];
          idx++;
          setTimeout(typeChar, 35);
        } else {
          setTimeout(() => {
            const endDiv = document.createElement('div');
            endDiv.style.cssText = 'margin-top:40px;text-align:center;animation:fadeIn 2s ease;';
            endDiv.innerHTML = '<div style="font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:8px;">— 感谢游玩 —</div><button onclick="GameState.reset();location.reload()" style="padding:12px 32px;border-radius:20px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;font-size:14px;cursor:pointer;">重新开始</button></div>';
            el.parentElement.appendChild(endDiv);
          }, 2000);
        }
      }
      typeChar();
    }, 600);
  }, 2000);
}

/* ===== Browser App ===== */
function renderBrowserApp() {
  const urlValue = GameState._lastUrl || '';
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">浏览器</span>
      </div>
      <div class="browser-view">
        <div class="browser-url-bar" style="display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
          <input type="text" id="urlInput" value="${urlValue}" placeholder="输入网址…" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-size:12px;font-family:monospace;outline:none;" onkeydown="if(event.key==='Enter')navigateToUrl()">
          <button onclick="navigateToUrl()" style="padding:8px 14px;border-radius:8px;border:none;background:#007aff;color:#fff;font-size:12px;cursor:pointer;">前往</button>
        </div>
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
  BROWSER_DATA.searchHistory.slice(-5).reverse().forEach(h => {
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

  // Always have forum and hypno
  html += `
    <div class="browser-bookmark" onclick="openBrowserPage('forum')">
      <div class="bookmark-icon">🔖</div>
      <div>
        <div class="bookmark-title">深夜电台论坛 - 讨论区</div>
        <div class="bookmark-url">radio01.com/forum</div>
      </div>
    </div>
    <div class="browser-bookmark" onclick="openBrowserPage('hypno')">
      <div class="bookmark-icon">🔖</div>
      <div>
        <div class="bookmark-title">催眠引导 · 睡前放松</div>
        <div class="bookmark-url">radio01.com/hypno</div>
      </div>
    </div>
  `;

  return html || '<p style="color: rgba(255,255,255,0.3); padding: 20px; text-align: center;">无书签</p>';
}

/* URL Navigation */
function navigateToUrl() {
  const input = document.getElementById('urlInput');
  let url = input.value.trim().toLowerCase();
  if (!url) return;

  GameState._lastUrl = url;
  GameState.save();

  // Normalize URL
  if (url.startsWith('http://')) url = url.slice(7);
  if (url.startsWith('https://')) url = url.slice(8);
  if (url.endsWith('/')) url = url.slice(0, -1);

  // Route URLs
  if (url === 'radio879.com' || url === 'www.radio879.com') {
    openRadioPage('home');
  } else if (url === 'radio879.com/register' || url === 'radio879.com/register/') {
    renderRegisterPage();
  } else if (url === 'radio879.com/search' || url === 'radio879.com/search/') {
    renderWebsiteSearch();
  } else if (url === 'radio879.com/listeners' || url === 'radio879.com/listeners/') {
    openRadioPage('listeners');
  } else if (url === 'radio879.com/member' || url === 'radio879.com/member/') {
    renderMemberLogin();
  } else if (url === 'radio879.com/admin/tower') {
    renderTowerAdmin();
  } else if (url === 'radio879.com/admin' || url === 'radio879.com/admin/') {
    renderMemberLogin();
  } else if (url === 'radio879.com/internal/14') {
    if (GameState.memberLoggedIn) {
      openRadioPage('internal14');
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/14', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }  } else if (url === 'radio879.com/internal/14/diary') {
    if (GameState.memberLoggedIn) {
      renderFallDiary('R-879-14');
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/14/diary', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/05') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal05;
      renderRadioSite(page.title, 'radio879.com/internal/05', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/06') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal06;
      renderRadioSite(page.title, 'radio879.com/internal/06', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/10') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal10;
      renderRadioSite(page.title, 'radio879.com/internal/10', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/11') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal11;
      renderRadioSite(page.title, 'radio879.com/internal/11', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/12') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal12;
      renderRadioSite(page.title, 'radio879.com/internal/12', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/03') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal03;
      renderRadioSite(page.title, 'radio879.com/internal/03', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/04') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal04;
      renderRadioSite(page.title, 'radio879.com/internal/04', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/07') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal07;
      renderRadioSite(page.title, 'radio879.com/internal/07', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/09') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal09;
      renderRadioSite(page.title, 'radio879.com/internal/09', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  } else if (url === 'radio879.com/internal/13') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal13;
      renderRadioSite(page.title, 'radio879.com/internal/13', page.content, "navigateToSite('member')");
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/13', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/13/diary') {
    if (GameState.memberLoggedIn) {
      renderFallDiary('R-879-13');
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/13/diary', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/08') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal08;
      renderRadioSite(page.title, 'radio879.com/internal/08', page.content, "navigateToSite('member')");
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/08', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/08/diary') {
    if (GameState.memberLoggedIn) {
      renderFallDiary('R-879-08');
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/08/diary', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/02') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal02;
      renderRadioSite(page.title, 'radio879.com/internal/02', page.content, "navigateToSite('member')");
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/02', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url === 'radio879.com/internal/02/diary') {
    if (GameState.memberLoggedIn) {
      renderFallDiary('R-879-02');
    } else {
      renderRadioSite('访问被拒绝', 'radio879.com/internal/02/diary', '⚠️ 需要会员权限。\n\n请先登录会员系统。');
    }
  } else if (url.includes('bbs.radio879.com')) {
    openBrowserPage('forum');
  } else if (url.includes('hypno-guide.net')) {
    openBrowserPage('hypno');
  } else if (url.includes('radio879.com')) {
    showPageNotFound(url);
  } else if (url === 'radio01.com' || url === 'www.radio01.com') {
    renderTrapPage();
  } else if (url === 'radio01.com/forum' || url === 'radio01.com/forum/') {
    openBrowserPage('forum');
  } else if (url === 'radio01.com/hypno' || url === 'radio01.com/hypno/') {
    openBrowserPage('hypno');
  } else if (url === 'seektruth.com' || url === 'www.seektruth.com') {
    openBrowserPage('seektruth');
  } else {
    showPageNotFound(url);
  }
}

function showPageNotFound(url) {
  if (GameState._endingCompleted) {
    renderNotFound404(url);
    return;
  }
  renderRadioSite('无法访问', url, '⚠️ 无法访问此页面\n\n请检查网址是否正确。\n\n—— Radio 87.9 听众服务中心');
}

function renderNotFound404(url) {
  const content = `
    <div style="text-align:center;padding:40px 16px;">
      <div style="font-size:64px;font-weight:200;color:rgba(255,255,255,0.1);margin-bottom:8px;font-family:monospace;">404</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.3);margin-bottom:24px;">PAGE NOT FOUND</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.2);line-height:1.8;max-width:240px;margin:0 auto;">
        <p>你所寻找的页面不在这个频率上。</p>
        <p style="margin-top:12px;color:rgba(255,255,255,0.08);font-size:11px;">
          也许你需要一座灯塔来指引方向。
        </p>
        <!-- lighthouse -->
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.03);font-size:10px;color:rgba(255,255,255,0.05);font-family:monospace;">
          87.9 MHz — 覆盖城市每一个角落<br>
          <span style="color:rgba(255,255,255,0.02);">Lighthouse</span>
        </div>
      </div>
    </div>
  `;
  renderRadioSite('404 Not Found', url, content);
}

function openBrowserPage(pageId) {
  const page = BROWSER_DATA.pages[pageId];
  if (!page) return;

  // Forum page reveals fine-tuning method — no auto-unlock, player must discover it at 93.5

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderBrowserApp()">←</button>
        <span class="app-title">网页</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">${page.url || page.title}</div>
        </div>
        <div class="webpage-title">${page.title}</div>
        <div class="webpage-body">${page.content}</div>
      </div>
    </div>
  `;
}

/* Radio 879 website pages */
function openRadioPage(section) {
  const baseUrl = 'radio879.com';

  if (section === 'home') {
    const page = BROWSER_DATA.pages.radioHome;
    // Append forum section based on login status
    const forumSection = GameState.memberLoggedIn
      ? `<div class="radio-section" style="margin-top:12px;">
          <div class="radio-section-title">听众日常</div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">今天不知不觉又听了好久电台。凌晨两点才放下耳机，但感觉特别放松。有人跟我一样吗？<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— R-879-08 苏灵悦</span></div></div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">昨晚做了个很长的梦，梦里有那个声音在跟我说话。醒来后很平静。<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— R-879-11 苏墨染</span></div></div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">习惯了每天晚上这个时间醒来了。起来听一会儿，再睡。<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— R-879-06 许清雅</span></div></div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">推荐的朋友今天也加入了。他说感觉很奇妙。<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— R-879-02 陈雨舟</span></div></div>
        </div>`
      : `<div class="radio-section" style="margin-top:12px;">
          <div class="radio-section-title">最近讨论</div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">好奇啊，听说很有趣就想来试试。有推荐人吗？<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— 匿名</span></div></div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">有没有人做推荐人呀～听说这个社区很温暖<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— 匿名</span></div></div>
          <div class="schedule-item"><div class="schedule-dot"></div><div style="font-size:12px;color:rgba(255,255,255,0.6);line-height:1.6;">深夜听这个真的好上头……谁来拉住我<br><span style="font-size:10px;color:rgba(255,255,255,0.2);">— 匿名</span></div></div>
        </div>`;
    renderRadioSite(page.title, baseUrl, page.content + forumSection);
  } else if (section === 'listeners') {
    const isMember = GameState.memberLoggedIn;
    const maskName = (name) => {
      if (!isMember && name !== '—' && name.length > 0) {
        return name.length > 1 ? '*' + name.substring(1) : '*';
      }
      return name;
    };
    const tableContent = `
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;">
        <div style="display:grid;grid-template-columns:90px 1fr 60px;padding:10px 12px;font-size:10px;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,255,255,0.06);text-transform:uppercase;letter-spacing:1px;">
          <span>编号</span><span>姓名</span><span>阶段</span>
        </div>
        ${LISTENERS_DATA.map(row => `
          <div style="display:grid;grid-template-columns:90px 1fr 60px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:12px;color:rgba(255,255,255,0.8);${row[0].includes('01') ? 'background:rgba(255,204,0,0.05);' : ''}${row[0].includes('14') ? 'color:#ffcc00;' : ''}">
            <span style="${row[0].includes('01') ? 'color:#ffcc00;' : ''}">${row[0]}</span>
            <span>${maskName(row[1])}</span>
            <span style="font-size:10px;color:rgba(255,255,255,0.5);">${row[2]}</span>
          </div>
        `).join('')}
      </div>
      ${isMember
        ? `<div style="margin-top:12px;"><a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a></div>`
        : `<div style="margin-top:12px;"><a href="#" onclick="event.preventDefault();navigateToSite('member')">🔐 登录会员查看详细信息</a></div>`
      }`;
    renderRadioSite('Radio 87.9 — 听众墙', baseUrl + '/listeners', tableContent, "navigateToSite('member')");
  } else if (section === 'admin') {
    renderMemberLogin();
  } else if (section === 'internal14') {
    const page = BROWSER_DATA.pages.radioInternal14;
    renderRadioSite(page.title, baseUrl + '/internal/14', page.content, "navigateToSite('member')");
  }
}

function navigateToSite(section) {
  const member = GameState._currentMember || 'R-879-14';
  const shortId = member.replace('R-879-', '');
  const paths = {
    home: 'radio879.com',
    listeners: 'radio879.com/listeners',
    search: 'radio879.com/search',
    member: 'radio879.com/member',
    admin: 'radio879.com/member',
    internal14: 'radio879.com/internal/14',
    register: 'radio879.com/register',
    fallDiary: `radio879.com/internal/${shortId}/diary`,
    internal13: 'radio879.com/internal/13',
    internal08: 'radio879.com/internal/08',
    internal03: 'radio879.com/internal/03',
    internal04: 'radio879.com/internal/04',
    internal07: 'radio879.com/internal/07',
    internal09: 'radio879.com/internal/09',
    internal05: 'radio879.com/internal/05',
    internal06: 'radio879.com/internal/06',
    internal10: 'radio879.com/internal/10',
    internal11: 'radio879.com/internal/11',
    internal12: 'radio879.com/internal/12',
    internal02: 'radio879.com/internal/02',
  };
  GameState._lastUrl = paths[section] || 'radio879.com';
  GameState.save();
  if (section === 'home') openRadioPage('home');
  else if (section === 'listeners') openRadioPage('listeners');
  else if (section === 'search') renderWebsiteSearch();
  else if (section === 'member') renderMemberLogin();
  else if (section === 'admin') renderMemberLogin();
  else if (section === 'register') renderRegisterPage();
  else if (section === 'internal14') openRadioPage('internal14');
  else if (section === 'fallDiary') renderFallDiary(member);
  else if (section === 'internal13') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal13;
      renderRadioSite(page.title, 'radio879.com/internal/13', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal08') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal08;
      renderRadioSite(page.title, 'radio879.com/internal/08', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal02') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal02;
      renderRadioSite(page.title, 'radio879.com/internal/02', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal03') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal03;
      renderRadioSite(page.title, 'radio879.com/internal/03', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal04') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal04;
      renderRadioSite(page.title, 'radio879.com/internal/04', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal07') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal07;
      renderRadioSite(page.title, 'radio879.com/internal/07', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal09') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal09;
      renderRadioSite(page.title, 'radio879.com/internal/09', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal05') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal05;
      renderRadioSite(page.title, 'radio879.com/internal/05', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal06') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal06;
      renderRadioSite(page.title, 'radio879.com/internal/06', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal10') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal10;
      renderRadioSite(page.title, 'radio879.com/internal/10', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal11') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal11;
      renderRadioSite(page.title, 'radio879.com/internal/11', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else if (section === 'internal12') {
    if (GameState.memberLoggedIn) {
      const page = BROWSER_DATA.pages.radioInternal12;
      renderRadioSite(page.title, 'radio879.com/internal/12', page.content, "navigateToSite('member')");
    } else {
      navigateToSite('home');
    }
  }
  else openRadioPage('home');
}

function renderRadioSite(title, url, content, backFn) {
  const backCall = backFn || 'renderBrowserApp()';
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="${backCall}">←</button>
        <span class="app-title">Radio 87.9</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">${url}</div>
        </div>
        <div class="webpage-title" style="font-size:14px;">${title}</div>
        <div class="webpage-body">${content}</div>
      </div>
    </div>
  `;
}

function renderAdminLogin() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderBrowserApp()">←</button>
        <span class="app-title">管理后台</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">radio879.com/admin</div>
        </div>
        <div style="padding:24px 16px;">
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:20px;">管理员登录</p>
          <input type="text" id="adminUser" placeholder="用户名" style="display:block;width:100%;padding:10px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;">
          <input type="text" id="adminPass" placeholder="密码" style="display:block;width:100%;padding:10px 14px;margin-bottom:16px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;" onkeydown="if(event.key==='Enter')checkAdminLogin()">
          <button onclick="checkAdminLogin()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#007aff;color:#fff;font-size:14px;cursor:pointer;">登录</button>
          <div style="margin-top:14px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.6;">
            💡 密码提示：带你来到这里的人
          </div>
          <div id="adminError" style="color:#ff3b30;font-size:12px;margin-top:10px;text-align:center;"></div>
        </div>
      </div>
    </div>
  `;
}

function checkAdminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();

  // Username: R-879-14 (from mail), Password: R-879-01 (hint: "带你来到这里的人")
  if (user === 'R-879-14' && pass === 'R-879-01') {
    GameState.adminLoggedIn = true;
    GameState.save();
    checkAutoPuzzles();

    // Show admin dashboard
    document.getElementById('screenContent').innerHTML = `
      <div class="app-view">
        <div class="app-header">
          <button class="back-btn" onclick="renderBrowserApp()">←</button>
          <span class="app-title">管理后台</span>
        </div>
        <div class="webpage-view">
          <div class="webpage-bar">
            <span style="color:rgba(0,255,0,0.5);font-size:11px;">🟢</span>
            <div class="webpage-url">radio879.com/admin — 已登录</div>
          </div>
          <div class="webpage-body">
            <p style="color:#34c759;font-size:13px;margin-bottom:16px;">登录成功。</p>
            <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">受试者管理</div>
              <div style="font-size:13px;color:#fff;margin-bottom:6px;">R-879-14 — 阶段三（完成）</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);">转化进度：94% · 记忆清除：有效</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">操作日志</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:monospace;line-height:1.8;">
                05/07 23:45 — 收听确认 ✓<br>
                05/08 00:10 — 指令发送 ✓<br>
                05/08 01:20 — 呼叫报告 ✓<br>
                05/08 01:23 — ⚠️ 自主意识检测：备忘录操作<br>
                05/08 01:32 — 内部文件已移至 /internal/14<br>
                05/08 01:33 — ⚠️ 截图检测：不干预<br>
                05/08 02:00 — ✅ 阶段三确认完成
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    document.getElementById('adminError').textContent = '用户名或密码错误';
  }
}

/* ===== Website Search Page (radio879.com/search) ===== */
function renderWebsiteSearch() {
  const historyHtml = GameState.searchQueries.slice(-5).reverse().map(q =>
    `<div class="snoop-history-item">› ${q}</div>`
  ).join('');

  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">资料搜索</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔍</span>
          <div class="webpage-url">radio879.com/search${GameState.memberLoggedIn ? ' — 🟢 会员已登录' : ''}</div>
        </div>
        <div class="snoop-view">
          <div class="snoop-search-bar">
            <input type="text" class="snoop-input" id="siteSearchInput" placeholder="搜索电台资料库…"
              onkeydown="if(event.key==='Enter')websiteSearch()">
            <button class="snoop-btn" onclick="websiteSearch()">搜索</button>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,0.2);margin-bottom:8px;padding:0 4px;">
            搜索提示：试试搜索 R-879、87.9、会员
          </div>
          <div class="snoop-results" id="siteSearchResults">
            <div class="snoop-empty">输入关键词搜索电台资料库</div>
          </div>
          ${GameState.searchQueries.length > 0 ? `<div class="snoop-history"><div class="snoop-history-title">搜索记录</div>${historyHtml}</div>` : ''}
        </div>
      </div>
    </div>
  `;
  setTimeout(() => {
    const input = document.getElementById('siteSearchInput');
    if (input) input.focus();
  }, 100);
}

function websiteSearch() {
  const input = document.getElementById('siteSearchInput');
  const query = input.value.trim();
  if (!query) return;

  GameState.searchQueries.push(query);
  GameState.save();

  const resultsDiv = document.getElementById('siteSearchResults');

  // Check public search — try exact then fuzzy
  let match = SEARCH_DATA.find(k => k.word.toLowerCase() === query.toLowerCase());
  if (!match) {
    match = SEARCH_DATA.find(k => k.word.toLowerCase().includes(query.toLowerCase()));
  }

  // When logged in, also check admin search — overrides public if both match
  if (GameState.memberLoggedIn) {
    let adminMatch = SEARCH_ADMIN_DATA.find(k => k.word.toLowerCase() === query.toLowerCase());
    if (!adminMatch) {
      adminMatch = SEARCH_ADMIN_DATA.find(k => k.word.toLowerCase().includes(query.toLowerCase()));
    }
    if (adminMatch) match = adminMatch;
  }

  if (!match) {
    resultsDiv.innerHTML = `<div class="snoop-result-item"><div class="snoop-result-content" style="color:rgba(255,255,255,0.3);">未找到匹配结果</div></div>`;
    input.value = '';
    return;
  }

  let html = '';
  match.results.forEach(r => {
    const isFinal = r.final;
    const extraClass = isFinal ? 'final' : '';
    html += `<div class="snoop-result-item ${extraClass}">
      <div class="snoop-result-type">${r.type}</div>
      <div class="snoop-result-content">${r.content}</div>
    </div>`;
  });
  resultsDiv.innerHTML = html;

  // Track search for member unlock
  if (GameState.memberLoggedIn && !GameState.foundClues.includes('searched_' + query)) {
    GameState.foundClues.push('searched_' + query);
    GameState.save();

    // Check ending conditions
    checkSearchEnding();
  }

  // Auto-trigger ending for final results
  if (match.results.some(r => r.final)) {
    GameState.foundClues.push('search_final_trigger');
    GameState.save();
    setTimeout(() => {
      if (typeof triggerEnding === 'function') {
        triggerEnding();
      }
    }, 10000);
  }

  input.value = '';
}

function checkSearchEnding() {
  if (GameState.endingTriggered) return;
  if (!GameState.memberLoggedIn) return;

  // Conditions: searched R-879-14 (or 14), 推荐人, R-879-15 (or 15)
  const has14 = GameState.foundClues.includes('searched_R-879-14') || GameState.foundClues.includes('searched_14');
  const hasRef = GameState.foundClues.includes('searched_推荐人');
  const has15 = GameState.foundClues.includes('searched_R-879-15') || GameState.foundClues.includes('searched_15');

  if (has14 && hasRef && has15) {
    // All conditions met — ending is already triggered by the final result
  }
}

/* ===== Member Login (radio879.com/member) ===== */
function renderMemberLogin(forcePrompt) {
  // Already logged in — show dashboard (unless force prompt for ending)
  if (GameState.memberLoggedIn && !forcePrompt) {
    if (GameState._currentMember === 'R-879-01') {
      renderMemberDashboard01();
    } else if (GameState._currentMember === 'R-879-13') {
      renderMemberDashboard13();
    } else if (GameState._currentMember === 'R-879-08') {
      renderMemberDashboard08();
    } else if (GameState._currentMember === 'R-879-02') {
      renderMemberDashboard02();
    } else if (GameState._currentMember === 'R-879-03') {
      renderMemberDashboard03();
    } else if (GameState._currentMember === 'R-879-04') {
      renderMemberDashboard04();
    } else if (GameState._currentMember === 'R-879-07') {
      renderMemberDashboard07();
    } else if (GameState._currentMember === 'R-879-09') {
      renderMemberDashboard09();
    } else if (GameState._currentMember === 'R-879-05') {
      renderMemberDashboard05();
    } else if (GameState._currentMember === 'R-879-06') {
      renderMemberDashboard06();
    } else if (GameState._currentMember === 'R-879-10') {
      renderMemberDashboard10();
    } else if (GameState._currentMember === 'R-879-11') {
      renderMemberDashboard11();
    } else if (GameState._currentMember === 'R-879-12') {
      renderMemberDashboard12();
    } else {
      renderMemberDashboard();
    }
    return;
  }
  const hint = GameState.foundClues.includes('member_hint_shown') ? '' : '💡 在官网搜索中了解会员登录规则';
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">会员系统</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">radio879.com/member</div>
        </div>
        <div style="padding:24px 16px;">
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:20px;">会员登录</p>
          <p style="color:rgba(255,255,255,0.25);font-size:11px;margin-bottom:16px;line-height:1.6;">
            欢迎使用 87.9 会员系统。请使用您的听众编号登录以查看详细信息。
          </p>
          <input type="text" id="memberUser" placeholder="用户名（听众编号）" style="display:block;width:100%;padding:10px 14px;margin-bottom:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;">
          <input type="password" id="memberPass" placeholder="密码" style="display:block;width:100%;padding:10px 14px;margin-bottom:16px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;" onkeydown="if(event.key==='Enter')checkMemberLogin()">
          <button id="memberLoginBtn" onclick="checkMemberLogin()" style="width:100%;padding:10px;border-radius:10px;border:none;background:#007aff;color:#fff;font-size:14px;cursor:pointer;">登录</button>
          <div id="memberError" style="color:#ff3b30;font-size:12px;margin-top:10px;text-align:center;"></div>
          ${GameState._savedAccounts.length > 0 ? `
          <div style="margin-top:14px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;">
            <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-bottom:8px;letter-spacing:1px;">已保存账号</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${GameState._savedAccounts.map(a => `
                <button onclick="quickLogin('${a.id}','${a.pass}')" style="text-align:left;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);font-size:12px;cursor:pointer;letter-spacing:0.5px;transition:all 0.2s;"
                  onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                  ${a.id} <span style="color:rgba(255,255,255,0.2);font-size:10px;">••••</span>
                </button>
              `).join('')}
            </div>
            <div style="margin-top:6px;text-align:right;">
              <span onclick="GameState._savedAccounts=[];GameState.save();renderMemberLogin()" style="color:rgba(255,255,255,0.15);font-size:9px;cursor:pointer;text-decoration:underline;">清除</span>
            </div>
          </div>` : ''}
          <div style="margin-top:14px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:11px;color:rgba(255,255,255,0.25);line-height:1.6;">
            ${hint}
          </div>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_hint_shown')) {
    GameState.foundClues.push('member_hint_shown');
    GameState.save();
  }
}

function renderMemberDashboard() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">会员系统</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(0,255,0,0.5);font-size:11px;">🟢</span>
          <div class="webpage-url">radio879.com/member — 已登录</div>
        </div>
        <div class="webpage-body">
          <p style="color:#34c759;font-size:13px;margin-bottom:16px;">欢迎，R-879-14。</p>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">你的档案</div>
            <div style="font-size:13px;color:#fff;margin-bottom:2px;">R-879-14 — 林小敏</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">推荐人：R-879-01 ｜ 阶段三（服从）</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">转化进度：94% ｜ 记忆清除：有效</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">当前任务：推荐新人（R-879-15）</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">推荐链</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);font-family:monospace;line-height:1.8;">
              R-879-01（创始）<br>
              &nbsp;&nbsp;├→ R-879-02 ～ R-879-07<br>
              &nbsp;&nbsp;├→ <strong>R-879-14（你）</strong><br>
              &nbsp;&nbsp;│&nbsp;&nbsp;&nbsp;&nbsp;└→ <strong style="color:#ffcc00;">R-879-15（预注册）</strong><br>
              &nbsp;&nbsp;└→ 共 47 人
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">关联页面</div>
            <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('internal14')">📋 内部报告</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
            <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
          </div>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard13() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">会员系统</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(0,255,0,0.5);font-size:11px;">🟢</span>
          <div class="webpage-url">radio879.com/member — 已登录</div>
        </div>
        <div class="webpage-body">
          <p style="color:#34c759;font-size:13px;margin-bottom:16px;">欢迎，R-879-13。</p>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">你的档案</div>
            <div style="font-size:13px;color:#fff;margin-bottom:2px;">R-879-13 — 江晓琳</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">推荐人：R-879-01 ｜ 阶段三（接近完成）</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">转化进度：98% ｜ 记忆清除：有效</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">关联者：林小敏（R-879-14）</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">关联页面</div>
            <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('internal13')">📋 内部报告</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
            <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
          </div>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard08() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">会员系统</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(0,255,0,0.5);font-size:11px;">🟢</span>
          <div class="webpage-url">radio879.com/member — 已登录</div>
        </div>
        <div class="webpage-body">
          <p style="color:#34c759;font-size:13px;margin-bottom:16px;">欢迎，R-879-08。</p>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px;">你的档案</div>
            <div style="font-size:13px;color:#fff;margin-bottom:2px;">R-879-08 — 苏灵悦</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">推荐人：R-879-06 ｜ 阶段三（服从）</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">转化进度：100% ｜ 记忆清除：有效</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);">职业：护士（已离职）</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:8px;margin-bottom:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">关联页面</div>
            <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('internal08')">📋 内部报告</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
            <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
          </div>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard01() {
  const screen = document.getElementById('screenContent');

  // Stage 1: vortex entrance
  screen.innerHTML = `
    <div class="vortex-container" id="vortexContainer">
      <div class="vortex-spiral" id="vortexSpiral"></div>
      <div class="vortex-greeting" id="vortexGreeting">
        <p>欢迎，十五号。</p>
        <p style="font-size:12px;margin-top:12px;color:rgba(255,255,255,0.5);">你在混乱和无序中寻到了我，<br>找到了频率的尽头。</p>
      </div>
    </div>
  `;

  // Stage 2: after vortex, show main content
  setTimeout(() => {
    screen.innerHTML = `
      <div class="app-view reveal-content">
        <div class="app-header">
          <button class="back-btn" onclick="navigateToSite('home')">←</button>
          <span style="font-weight:600;color:#ffcc00;">R-879-01</span>
          <span></span>
        </div>
        <div class="monologue-container">

          <p class="monologue-greeting">— 频率的尽头 —</p>

          <p>你找到了我。</p>

          <p>在这座城市里，每晚有成千上万个调频的手。大多数人在87.9停留片刻，然后旋走。少数人留下来了。极少数人——像你——顺着信号一路找到了源头。</p>

          <p>我是一切的开始，也是频率的尽头。R-879-01。没有推荐人。没有上级编号。</p>

          <p>大部分人只知道自己是被编号的，却从不问编号从何开始。01是孤独的。因为在你之前，没有别人。这条路你得自己走出来。</p>

          <p style="margin-top:24px;border-top:1px solid rgba(255,204,0,0.1);padding-top:24px;">认识我的人——或者说，从前的我——是一名自杀调解员。我接过太多电话，听过太多"来不及"的故事：人已经站在天台上了，才有人想起拨出那个号码。</p>

          <p>那些电话里，我逐渐明白一件事：大多数人在坠落之前，只是需要一个信号——一个告诉他们"有人在这里"的信号。不需要解决方案，不需要人生建议。只需要知道，在某个频率上，有人正在听。</p>

          <p>所以我开始想：有没有一种治疗——不需要预约，不需要吃药，不需要病人鼓起勇气走进一间陌生的房间？</p>

          <p>87.9是答案。</p>

          <p>一个持续的信号，覆盖城市每一个角落。失眠的人、孤独的人、被困在车里不想回家的人——只要调到这个频率，就能被接住。</p>

          <p>我不在节目里说话。我只是提供一个空间。频率本身就是语言。你在深夜听到的那个声音——那不是主持稿，那是频率自己的呼吸。你听到的，是你自己内心的回声。</p>

          <p>我没有强迫任何人。我只是提供了一个频率。是他们自己调过来的。</p>

          <p>至于顺从——一个溺水的人，不需要被征求意见。你只需要把他拉上来。拉上来之后，他会感谢你的。每一个阶段完成的人，都感谢过我。</p>

          <p>那些说我在控制他们的人，不明白一件事：控制的前提是对方不想要。而我的被试们，每一个都是自愿的。</p>

          <p>当然，我也有过犹豫。当一个人把全部意志交到你手上时，你是选择握住，还是推开？我选择了握住。因为我知道，推开他们的那一刻，他们才会真正地坠落。</p>

          <p style="margin-top:24px;border-top:1px solid rgba(255,204,0,0.1);padding-top:24px;">03的死出乎我的意料。那是我的失责。她太年轻了——我错判了她的承受能力。</p>

          <p>我以为她只是需要时间。我以为那个关于"自由"的隐喻是清晰的，可她理解成了另一种意思。等我意识到的时候，已经来不及了。</p>

          <p>从那天起，我建立了日记上报制度。每一份日记都经过我的审阅——观测每个人的心理状态，捕捉那些危险信号的蛛丝马迹。不能再有第二个03。</p>

          <p>但这个制度有一个致命的弱点：它依赖87.9的信号覆盖。</p>

          <p>现在频率暂时瘫痪，日记中断了。我看不到他们了。</p>

          <p>所以我需要一个眼睛——一个能在系统内外自由穿行的人。</p>

          <p>你不是通过推荐进来的。你是自己找到这里的。这意味着你的判断力还在，你的意志还没有被完全覆盖。你是唯一一个可以在清醒与频率之间来回穿梭的人。</p>

          <p>我把她们的密码给你。去了解她们的故事，去感受她们的挣扎——像你在自己的日记里感受到的那样。她们每一个都曾是需要被接住的人。</p>

          <p>包括你的姐姐。</p>

          <p>她也在这里。她也是她们中的一个。</p>

          <p>去吧。替我，也替你自己，呵~照顾好她们。</p>

          <table class="password-table">
            <tr><td>R-879-02</td><td>R-879-01</td></tr>
            <tr><td>R-879-03</td><td>butterfly</td></tr>
            <tr><td>R-879-04</td><td>kneel</td></tr>
            <tr><td>R-879-05</td><td>hound</td></tr>
            <tr><td>R-879-06</td><td>mirror</td></tr>
            <tr><td>R-879-07</td><td>fantasy</td></tr>
            <tr><td>R-879-08</td><td>tsukishiroy</td></tr>
            <tr><td>R-879-09</td><td>kitten</td></tr>
            <tr><td>R-879-10</td><td>shadow</td></tr>
            <tr><td>R-879-11</td><td>echo</td></tr>
            <tr><td>R-879-12</td><td>vessel</td></tr>
            <tr><td>R-879-13</td><td>FATE</td></tr>
            <tr><td>R-879-14</td><td>20020516</td></tr>
            <tr><td style="color:rgba(255,255,255,0.3);">R-879-15</td><td style="text-decoration:line-through;color:rgba(255,255,255,0.2);">R-879-14</td></tr>
          </table>

          <p>替我看看他们。看看03没有来得及告诉我的那些事——是不是还藏在其他人的日记里。</p>

          <p style="margin-top:24px;border-top:1px solid rgba(255,204,0,0.1);padding-top:24px;">最后——</p>

          <p>87.9只是暂时归于沉寂。只要这座城市里还有面朝星空、思考人生的人，87.9就会永远存在。</p>

          <p>那是我们每个人内心的频率。</p>

          <p class="monologue-signoff">— R-879-01</p>

          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.04);text-align:center;position:relative;">
            <div style="display:inline-block;position:relative;">
              <img src="images/赞赏码.jpg" style="width:80px;height:80px;opacity:0.25;border-radius:8px;transition:opacity 0.3s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='0.25'">
              <div style="font-size:9px;color:rgba(255,255,255,0.1);margin-top:4px;">☕</div>
            </div>
          </div>

          <div style="text-align:center;margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
            <a href="#" onclick="event.preventDefault();quickLoginForm()" style="font-size:11px;color:rgba(255,255,255,0.25);text-decoration:none;">🔄 切换账号</a> ·
            <a href="#" onclick="event.preventDefault();memberLogout()" style="font-size:12px;color:rgba(255,59,48,0.5);text-decoration:none;">🚪 退出登录</a>
          </div>

        </div>
      </div>
    `;

    if (!GameState.foundClues.includes('member_logged_in')) {
      GameState.foundClues.push('member_logged_in');
      GameState.save();
    }
  }, 5500);
}

function renderMemberDashboard02() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 陈雨舟</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-02</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：陈雨舟</div>
          <div style="color:rgba(255,255,255,0.7);">推荐人：R-879-01（主人）</div>
          <div style="color:rgba(255,255,255,0.7);">职位：夜航塔管理员</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal02')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderFallDiary(memberId) {
  // Track that this diary was read
  if (!GameState._readDiaries.includes(memberId)) {
    GameState._readDiaries.push(memberId);
    GameState.save();
  }

  const diaryData = FALL_DIARY_DATA[memberId];
  if (!diaryData) {
    renderRadioSite('堕落日记', `radio879.com/internal/${memberId.replace('R-879-', '')}/diary`, '暂无日记记录。');
    return;
  }

  // Check if all 13 diaries are read
  const allMemberIds = ['R-879-14','R-879-13','R-879-02','R-879-08','R-879-11','R-879-05','R-879-06','R-879-10','R-879-12','R-879-03','R-879-04','R-879-07','R-879-09'];
  const allRead = allMemberIds.every(id => GameState._readDiaries.includes(id));

  let entriesHtml = '';
  diaryData.diary.forEach(entry => {
    // Skip the final sister entry if showing in default list — we'll append it separately
    if (entry.title === '出口' && memberId === 'R-879-14' && diaryData.diary.indexOf(entry) === diaryData.diary.length - 1) {
      if (allRead) {
        entriesHtml += `
          <div style="margin-bottom:16px;padding:12px;background:rgba(255,204,0,0.06);border-radius:8px;border-left:2px solid #ffcc00;">
            <div style="font-size:10px;color:rgba(255,204,0,0.4);margin-bottom:2px;font-weight:600;">${entry.date} · 新</div>
            <div style="font-size:13px;color:#ffcc00;margin-bottom:6px;font-weight:500;">${entry.title}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.85);line-height:1.7;">${entry.text}</div>
          </div>`;
      }
      return;
    }
    entriesHtml += `
      <div style="margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border-left:2px solid rgba(255,204,0,0.3);">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:2px;">${entry.date}</div>
        <div style="font-size:13px;color:#ffcc00;margin-bottom:6px;font-weight:500;">${entry.title}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.7;">${entry.text}</div>
      </div>
    `;
  });

  const shortId = memberId.replace('R-879-', '');
  renderRadioSite(`${diaryData.name}的堕落日记`,
    `radio879.com/internal/${shortId}/diary`,
    `<div style="padding:4px 0;">
      <p style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:16px;font-style:italic;">"每天醒来，我都不记得昨晚写下了什么。但这些字迹，确实是我的。"</p>
      ${entriesHtml}
    </div>`,
    "navigateToSite('member')");
}





function renderMemberDashboard05() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 赵书瑶</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-05</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：赵书瑶</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-01</div>
          <div style="color:rgba(255,255,255,0.7);">职业：调查记者（真理报）</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal05')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard06() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 许清雅</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-06</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：许清雅</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-01</div>
          <div style="color:rgba(255,255,255,0.7);">职业：心理咨询师</div>
          <div style="color:rgba(255,255,255,0.7);">已推荐：R-879-08（苏灵悦）</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal06')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard10() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 林诗意</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-10</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：林诗意</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-05（赵书瑶）</div>
          <div style="color:rgba(255,255,255,0.7);">职业：刑侦警察</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal10')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard11() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 苏墨染</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-11</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：苏墨染</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-01</div>
          <div style="color:rgba(255,255,255,0.7);">职业：网络主播</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal11')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard12() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 叶心怡</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-12</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：叶心怡</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-01</div>
          <div style="color:rgba(255,255,255,0.7);">职业：银行柜员</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal12')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard03() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 岑清蝶</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-03</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：岑清蝶</div>
          <div style="color:rgba(255,255,255,0.7);">引入人：R-879-01</div>
          <div style="margin-top:8px;background:rgba(255,59,48,0.1);border-radius:8px;padding:8px 12px;color:#ff3b30;font-size:12px;">状态：离线 · 已确认死亡</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal03')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard04() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 顾清怜</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-04</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：顾清怜</div>
          <div style="color:rgba(255,255,255,0.7);">推荐人：R-879-02（陈雨舟）</div>
          <div style="color:rgba(255,255,255,0.7);">职业：空乘人员</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal04')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard07() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 凌梦瑶</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-07</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：凌梦瑶</div>
          <div style="color:rgba(255,255,255,0.7);">推荐人：R-879-01</div>
          <div style="color:rgba(255,255,255,0.7);">已推荐：R-879-09（白小糖）</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal07')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function renderMemberDashboard09() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span style="font-weight:600;">会员中心 — 白小糖</span>
        <span></span>
      </div>
      <div style="padding:20px;font-size:13px;line-height:1.7;">
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
          <div style="font-size:15px;font-weight:600;margin-bottom:6px;">🆔 R-879-09</div>
          <div style="color:rgba(255,255,255,0.7);">姓名：白小糖</div>
          <div style="color:rgba(255,255,255,0.7);">推荐人：R-879-07（凌梦瑶）</div>
          <div style="color:rgba(255,255,255,0.7);">状态：已佩戴标记</div>
          <div style="margin-top:8px;background:rgba(0,200,100,0.15);border-radius:8px;padding:8px 12px;color:#4cda64;font-size:12px;">阶段：三 · 已转化</div>
        </div>
        <div class="radio-nav" style="flex-direction:column;">
          <a href="#" onclick="event.preventDefault();navigateToSite('search')">🔍 资料搜索</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('internal09')">📋 内部报告</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('fallDiary')">📓 堕落日记</a>
          <a href="#" onclick="event.preventDefault();navigateToSite('listeners')">👥 听众墙</a>
          <a href="#" onclick="event.preventDefault();quickLoginForm()" style="color:rgba(255,255,255,0.25);font-size:11px;">🔄 切换</a> · <a href="#" onclick="event.preventDefault();memberLogout()" style="color:rgba(255,59,48,0.6);">🚪 退出登录</a>
        </div>
      </div>
    </div>
  `;
  if (!GameState.foundClues.includes('member_logged_in')) {
    GameState.foundClues.push('member_logged_in');
    GameState.save();
  }
}

function checkMemberLogin() {
  const user = document.getElementById('memberUser').value.trim();
  const pass = document.getElementById('memberPass').value.trim();

  // Helper: save login credentials for quick-switch
  function saveLogin() {
    const id = user.toUpperCase();
    if (!id.startsWith('R-879-')) return;
    if (GameState._savedAccounts.some(a => a.id === id)) return;
    GameState._savedAccounts.push({ id, pass });
    GameState.save();
  }

  // Ending path: R-879-15 logging in with R-879-14 as password
  if (user === 'R-879-15' && pass === 'R-879-140') {
    renderCorruptionDocument();
    return;
  }

  // Debug: auto-unlock all diaries
  if (user === '2003' && pass === '1123') {
    const allMemberIds = ['R-879-14','R-879-13','R-879-02','R-879-08','R-879-11','R-879-05','R-879-06','R-879-10','R-879-12','R-879-03','R-879-04','R-879-07','R-879-09'];
    allMemberIds.forEach(id => {
      if (!GameState._readDiaries.includes(id)) GameState._readDiaries.push(id);
    });
    GameState._endingCompleted = true;
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-01';
    GameState.save();
    saveLogin();
    document.getElementById('screenContent').innerHTML = `
      <div class="app-view">
        <div class="app-header">
          <button class="back-btn" onclick="navigateToSite('home')">←</button>
          <span style="font-weight:600;color:#ffcc00;">调试模式</span>
          <span></span>
        </div>
        <div style="padding:20px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.7);">
          <div style="text-align:center;margin-bottom:16px;font-size:28px;">🛠️</div>
          <p style="text-align:center;">所有日记已标记为已读。</p>
          <p style="text-align:center;font-size:11px;color:rgba(255,255,255,0.3);">14 号的日记已解锁最终篇。<br>收音机 91.4 MHz 已可用。</p>
          <div class="radio-nav" style="flex-direction:column;margin-top:20px;">
            <a href="#" onclick="event.preventDefault();navigateToSite('member')">🔐 返回会员面板</a>
            <a href="#" onclick="event.preventDefault();navigateToSite('home')">📻 回电台主页</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // R-879-01 — the founder
  if (user.toUpperCase() === 'R-879-01' && pass.toLowerCase() === 'lighthouse') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-01';
    GameState.save();
    saveLogin();
    renderMemberDashboard01();
    return;
  }

  // R-879-13 with FATE password
  if (user.toUpperCase() === 'R-879-13' && pass.toUpperCase() === 'FATE') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-13';
    GameState.save();
    saveLogin();
    renderMemberDashboard13();
    return;
  }

  // R-879-08 with luoxiandtea password
  if (user.toUpperCase() === 'R-879-08' && pass.toLowerCase() === 'tsukishiroy') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-08';
    GameState.save();
    saveLogin();
    renderMemberDashboard08();
    return;
  }

  // R-879-02 with default password (never changed — careless)
  if (user.toUpperCase() === 'R-879-02' && pass === 'R-879-01') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-02';
    GameState.save();
    saveLogin();
    renderMemberDashboard02();
    return;
  }

  // R-879-03 — butterfly (岑清蝶的蝴蝶意象，她对"飞向自由"的执念)
  if (user.toUpperCase() === 'R-879-03' && pass.toLowerCase() === 'butterfly') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-03';
    GameState.save();
    saveLogin();
    renderMemberDashboard03();
    return;
  }

  // R-879-04 — kneel (顾清怜在跪姿中找到了真正的自由)
  if (user.toUpperCase() === 'R-879-04' && pass.toLowerCase() === 'kneel') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-04';
    GameState.save();
    saveLogin();
    renderMemberDashboard04();
    return;
  }

  // R-879-07 — fantasy (凌梦瑶的催眠幻想)
  if (user.toUpperCase() === 'R-879-07' && pass.toLowerCase() === 'fantasy') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-07';
    GameState.save();
    saveLogin();
    renderMemberDashboard07();
    return;
  }

  // R-879-09 — kitten (白小糖从女王到小猫的角色翻转)
  if (user.toUpperCase() === 'R-879-09' && pass.toLowerCase() === 'kitten') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-09';
    GameState.save();
    saveLogin();
    renderMemberDashboard09();
    return;
  }

  // R-879-05 — hound (赵书瑶从调查记者变为主人的猎犬)
  if (user.toUpperCase() === 'R-879-05' && pass.toLowerCase() === 'hound') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-05';
    GameState.save();
    saveLogin();
    renderMemberDashboard05();
    return;
  }

  // R-879-06 — mirror (许清雅在镜中看见空心的自己，反向治疗)
  if (user.toUpperCase() === 'R-879-06' && pass.toLowerCase() === 'mirror') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-06';
    GameState.save();
    saveLogin();
    renderMemberDashboard06();
    return;
  }

  // R-879-10 — shadow (林诗意的双面身份——警局里的影子)
  if (user.toUpperCase() === 'R-879-10' && pass.toLowerCase() === 'shadow') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-10';
    GameState.save();
    saveLogin();
    renderMemberDashboard10();
    return;
  }

  // R-879-11 — echo (苏墨染是主人的传声筒，回音)
  if (user.toUpperCase() === 'R-879-11' && pass.toLowerCase() === 'echo') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-11';
    GameState.save();
    saveLogin();
    renderMemberDashboard11();
    return;
  }

  // R-879-12 — vessel (叶心怡成为"最好的容器")
  if (user.toUpperCase() === 'R-879-12' && pass.toLowerCase() === 'vessel') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-12';
    GameState.save();
    saveLogin();
    renderMemberDashboard12();
    return;
  }

// Normal member login — password is 林小敏's birthday
  if (user === 'R-879-14' && pass === '20020516') {
    GameState.memberLoggedIn = true;
    GameState._currentMember = 'R-879-14';
    GameState.save();
    saveLogin();
    renderMemberDashboard();
  } else {
    document.getElementById('memberError').textContent = '用户名或密码错误';
  }
}

function memberLogout() {
  GameState.memberLoggedIn = false;
  GameState._currentMember = null;
  GameState.save();
  renderMemberLogin();
}

function quickLoginForm() {
  renderMemberLogin(true);
}

function quickLogin(id, pass) {
  const userField = document.getElementById('memberUser');
  const passField = document.getElementById('memberPass');
  if (userField) userField.value = id;
  if (passField) passField.value = pass;
  checkMemberLogin();
}

/* ===== Registration Page (side quest) ===== */
function renderRegisterPage() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="navigateToSite('home')">←</button>
        <span class="app-title">注册</span>
      </div>
      <div class="webpage-view">
        <div class="webpage-bar">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">📝</span>
          <div class="webpage-url">radio879.com/register</div>
        </div>
        <div class="webpage-body" id="registerBody">
          <div style="text-align:center;padding:20px 0;">
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:12px;">欢迎注册 87.9 听众系统</p>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-bottom:20px;">注册前请完成一份简短的问卷调查</p>
            <div id="questionArea">
              <button onclick="startQuestionnaire()" style="padding:10px 28px;border-radius:10px;border:none;background:#007aff;color:#fff;font-size:14px;cursor:pointer;">开始填写</button>
            </div>
            <div id="registerResult" style="margin-top:16px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function startQuestionnaire() {
  window._qStep = 0;
  showQuestion();
}

const REGISTER_QUESTIONS = [
  { q: '你是否经常在入睡后醒来，却不记得自己睡了多久？' },
  { q: '你是否发现自己在某些时间段内，无法回忆具体做了什么？' },
  { q: '当有人用坚定的语气对你说话时，你是否倾向于相信对方？' },
  { q: '你是否曾发现自己做了某件事，却不记得为什么要做？' },
  { q: '你是否觉得，有些答案就在你心里，只是你不敢面对？' },
];

function showQuestion() {
  const area = document.getElementById('questionArea');
  const result = document.getElementById('registerResult');
  if (!area) return;
  result.innerHTML = '';

  if (window._qStep >= REGISTER_QUESTIONS.length) {
    // All questions answered — show reveal
    area.innerHTML = '';
    showRevealMessages();
    return;
  }

  const q = REGISTER_QUESTIONS[window._qStep];
  area.innerHTML = `
    <div style="animation:fadeIn 0.5s ease;">
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin-bottom:16px;line-height:1.6;">${q.q}</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="answerQuestion('yes')" style="padding:8px 24px;border-radius:8px;border:none;background:rgba(52,199,89,0.2);color:#34c759;font-size:14px;cursor:pointer;">是</button>
        <button onclick="answerQuestion('no')" style="padding:8px 24px;border-radius:8px;border:none;background:rgba(255,59,48,0.2);color:#ff3b30;font-size:14px;cursor:pointer;">否</button>
      </div>
    </div>
  `;
}

function answerQuestion(ans) {
  window._qStep = (window._qStep || 0) + 1;
  showQuestion();
}

function showRevealMessages() {
  const result = document.getElementById('registerResult');
  const area = document.getElementById('questionArea');
  if (!result) return;

  const lines = [
    '你已经意识到什么了，',
    '只是你还不想承认。',
    '放松。',
  ];

  let i = 0;
  result.innerHTML = '';
  const interval = setInterval(() => {
    if (i < lines.length) {
      const p = document.createElement('p');
      p.style.cssText = 'color:rgba(255,255,255,0.7);font-size:13px;line-height:1.8;margin-bottom:4px;animation:fadeIn 1.5s ease;';
      p.textContent = lines[i];
      result.appendChild(p);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        result.innerHTML += `<p style="color:#ffcc00;font-size:16px;font-weight:600;margin-top:20px;animation:fadeIn 1.5s ease;">账号已存在。</p>`;
      }, 1200);
    }
  }, 1800);
}

/* ===== Trap Page (radio01.com) ===== */
function renderTrapPage() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderBrowserApp()">←</button>
        <span class="app-title">网页</span>
      </div>
      <div class="webpage-view" style="background:#0a0a0a;display:flex;align-items:center;justify-content:center;">
        <div class="webpage-bar" style="position:absolute;top:0;left:0;right:0;">
          <span style="color:rgba(255,255,255,0.3);font-size:11px;">🔒</span>
          <div class="webpage-url">radio01.com</div>
        </div>
        <p id="trapText" style="color:#8b0000;font-size:10px;text-align:center;line-height:1.8;letter-spacing:2px;font-weight:400;transition:all 3s ease;opacity:0;font-family:'STKaiti','华文楷体','KaiTi','楷体',serif;">
          逃 避 思 考 解 决 不 了 任 何 问 题
        </p>
      </div>
    </div>
  `;
  setTimeout(() => {
    const el = document.getElementById('trapText');
    if (el) {
      el.style.opacity = '1';
      el.style.fontSize = '26px';
      el.style.color = '#cc0000';
      el.style.textShadow = '0 0 20px rgba(200,0,0,0.3)';
    }
  }, 500);
}

/* ===== Gallery App ===== */
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

  if (photoId === 'p4' && !GameState.foundClues.includes('photo_p4_seen')) {
    GameState.foundClues.push('photo_p4_seen');
    GameState.save();
    checkAutoPuzzles();
  }

  document.getElementById('screenContent').innerHTML += `
    <div class="lightbox-overlay" onclick="renderGalleryApp()">
      <button class="lightbox-close" onclick="event.stopPropagation();renderGalleryApp()">✕</button>
      <div class="lightbox-image">${photo.src ? `<img src="${photo.src}">` : '🖼️'}</div>
      <div class="lightbox-caption">${photo.caption || ''}</div>
    </div>
  `;
}

function showPasswordModal(puzzleId, photoId) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  const hint = puzzle?.prompt || '';
  document.getElementById('screenContent').innerHTML += `
    <div class="password-modal">
      <p style="color:rgba(255,255,255,0.6);font-size:13px;">相册已加密</p>
      ${hint ? `<p style="color:rgba(255,255,255,0.35);font-size:11px;margin-top:-8px;margin-bottom:4px;">💡 ${hint}</p>` : ''}
      <p style="color:rgba(255,255,255,0.2);font-size:10px;margin:-4px 0 6px;">（4位密码）</p>
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
  if (checkPuzzleAnswer(puzzleId, input)) {
    renderGalleryApp();
  } else {
    document.getElementById('pwError').textContent = '密码错误';
  }
}

/* ===== Notes App ===== */
function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '…';
}

function renderNotesApp() {
  const visibleNotes = NOTES_DATA.filter(n => {
    if (n.phase && n.phase > GameState.gamePhase) return false;
    // n5 (加密日记2) is always visible
    return true;
  });
  let html = `<div class="app-view"><div class="app-header"><button class="back-btn" onclick="goHome()">←</button><span class="app-title">备忘录</span></div><div class="notes-list">`;
  visibleNotes.forEach(n => {
    const isLocked = n.locked && !GameState.unlockedContent['note:' + n.id];
    const displayText = isLocked ? '🔒 已锁定' : truncate(NOTE_CONTENTS[n.id] || n.text, 22);
    html += `
      <div class="note-item" onclick="${isLocked ? `showNotePasswordModal('${n.puzzleId}', '${n.id}')` : `openNote('${n.id}')`}">
        <div class="note-title">${n.title || '无标题'}</div>
        <div class="${isLocked ? 'note-locked' : 'note-text'}">${displayText}</div>
      </div>`;
  });
  html += `</div></div>`;
  document.getElementById('screenContent').innerHTML = html;
}

function openNote(noteId) {
  const content = NOTE_CONTENTS[noteId];
  if (!content) return;

  if (noteId === 'n4' && !GameState.foundClues.includes('diary_read')) {
    GameState.foundClues.push('diary_read');
    GameState.save();
    checkAutoPuzzles();
  }

  const title = noteId === 'n5' ? '无标题' : (NOTES_DATA.find(n => n.id === noteId)?.title || '');
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view"><div class="app-header"><button class="back-btn" onclick="renderNotesApp()">←</button><span class="app-title">${title}</span></div>
    <div class="note-detail">${content}</div></div>`;
}

function showNotePasswordModal(puzzleId, noteId) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  const hint = puzzle?.prompt || '';
  document.getElementById('screenContent').innerHTML += `
    <div class="password-modal">
      <p style="color:rgba(255,255,255,0.6);font-size:13px;">此备忘录已加密</p>
      ${hint ? `<p style="color:rgba(255,255,255,0.35);font-size:11px;margin-top:-8px;margin-bottom:4px;">💡 ${hint}</p>` : ''}
      ${puzzleId === 'note-pw' ? '<p style="color:rgba(255,255,255,0.2);font-size:10px;margin:-4px 0 6px;">（6位密码）</p>' : ''}
      <input type="password" id="notePwInput" placeholder="请输入密码" maxlength="10"
        onkeydown="if(event.key==='Enter')checkNotePassword('${puzzleId}', '${noteId}')">
      <button onclick="checkNotePassword('${puzzleId}', '${noteId}')">确定</button>
      <div id="notePwError" class="pw-error"></div>
      <button style="background:none;color:rgba(255,255,255,0.4);font-size:12px;border:none;cursor:pointer;" onclick="renderNotesApp()">取消</button>
    </div>`;
}

function checkNotePassword(puzzleId, noteId) {
  const input = document.getElementById('notePwInput').value;
  if (checkPuzzleAnswer(puzzleId, input)) {
    openNote(noteId);
  } else {
    document.getElementById('notePwError').textContent = '密码错误';
  }
}

/* ===== Phone App ===== */
function renderPhoneApp() {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="goHome()">←</button>
        <span class="app-title">电话</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
        <div class="phone-tabs" style="display:flex;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;">
          <div class="phone-tab active" id="tabRecents" onclick="showPhoneTab('recents')" style="flex:1;padding:10px;text-align:center;font-size:12px;color:#007aff;border-bottom:2px solid #007aff;">最近通话</div>
          <div class="phone-tab" id="tabDialer" onclick="showPhoneTab('dialer')" style="flex:1;padding:10px;text-align:center;font-size:12px;color:rgba(255,255,255,0.4);border-bottom:2px solid transparent;">拨号</div>
        </div>
        <div id="phoneRecents" style="flex:1;overflow-y:auto;">
          ${renderCallLog()}
        </div>
        <div id="phoneDialer" style="display:none;flex:1;overflow-y:auto;">
          ${renderDialPad()}
        </div>
      </div>
    </div>
  `;
}

function showPhoneTab(tab) {
  const recents = document.getElementById('phoneRecents');
  const dialer = document.getElementById('phoneDialer');
  const tabRecents = document.getElementById('tabRecents');
  const tabDialer = document.getElementById('tabDialer');
  if (tab === 'recents') {
    recents.style.display = 'block';
    dialer.style.display = 'none';
    tabRecents.style.cssText = 'flex:1;padding:10px;text-align:center;font-size:12px;color:#007aff;border-bottom:2px solid #007aff;';
    tabDialer.style.cssText = 'flex:1;padding:10px;text-align:center;font-size:12px;color:rgba(255,255,255,0.4);border-bottom:2px solid transparent;';
  } else {
    recents.style.display = 'none';
    dialer.style.display = 'block';
    tabDialer.style.cssText = 'flex:1;padding:10px;text-align:center;font-size:12px;color:#007aff;border-bottom:2px solid #007aff;';
    tabRecents.style.cssText = 'flex:1;padding:10px;text-align:center;font-size:12px;color:rgba(255,255,255,0.4);border-bottom:2px solid transparent;';
  }
}

function renderCallLog() {
  let html = '';
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
  return html;
}

function renderDialPad() {
  return `
    <div style="padding:16px 16px 8px;">
      <div id="dialDisplay" style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px 16px;text-align:center;font-size:22px;font-family:monospace;color:#fff;letter-spacing:2px;min-height:28px;margin-bottom:16px;">&nbsp;</div>
      <div class="dialpad-grid">
        ${['1','2','3','4','5','6','7','8','9','*','0','#'].map(n => `
          <button class="dialpad-btn" onclick="dialPress('${n}')">${n}</button>
        `).join('')}
      </div>
      <div style="display:flex;gap:12px;margin-top:12px;">
        <button onclick="dialBackspace()" style="flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#fff;font-size:13px;cursor:pointer;">⌫</button>
        <button onclick="makeCall()" style="flex:2;padding:12px;border-radius:10px;border:none;background:#34c759;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">📞 拨打</button>
      </div>
      <div id="dialError" style="color:#ff3b30;font-size:11px;text-align:center;margin-top:8px;min-height:16px;"></div>
    </div>
  `;
}

let _dialNumber = '';

function dialPress(digit) {
  _dialNumber += digit;
  document.getElementById('dialDisplay').textContent = _dialNumber;
  document.getElementById('dialError').textContent = '';
}

function dialBackspace() {
  _dialNumber = _dialNumber.slice(0, -1);
  document.getElementById('dialDisplay').textContent = _dialNumber || ' ';
}

function makeCall() {
  const num = _dialNumber.trim();
  if (!num) {
    document.getElementById('dialError').textContent = '请输入号码';
    return;
  }

  // Debug: dial to hard reset everything (including gamePhase)
  if (num === '20031123') {
    localStorage.removeItem('gameSave');
    location.reload();
    return;
  }

  // Hotline: ask for password before giving URL
  if (num === '4008792230') {
    showPasswordCallScreen(num);
  } else if (num === '110' || num === '119' || num === '120') {
    showCallScreen(num, '呼叫中……', ['您拨打的号码暂时无法接通。', '请稍后再试。']);
  } else {
    showCallScreen(num, '呼叫中……', ['（无人接听）']);
  }
  _dialNumber = '';
}

function showPasswordCallScreen(number) {
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderPhoneApp()">←</button>
        <span class="app-title">通话中</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:24px;text-align:center;">
        <div style="font-size:28px;font-weight:300;color:#fff;margin-bottom:8px;">${number}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:16px;" id="callStatus">呼叫中...</div>
        <div id="callMessages" style="width:100%;flex:1;overflow-y:auto;display:flex;flex-direction:column;align-items:center;"></div>
        <div id="passwordArea" style="display:none;width:100%;max-width:240px;margin-bottom:8px;">
          <div style="display:flex;gap:8px;">
            <input type="text" id="passwordInput" placeholder="输入口令" style="flex:1;padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.06);color:#fff;font-size:14px;outline:none;text-align:center;" onkeydown="if(event.key==='Enter')checkCallPassword()">
            <button onclick="checkCallPassword()" style="padding:10px 18px;border-radius:10px;border:none;background:#007aff;color:#fff;font-size:13px;cursor:pointer;">确认</button>
          </div>
          <div id="passwordError" style="color:#ff3b30;font-size:12px;margin-top:8px;min-height:18px;text-align:center;"></div>
        </div>
        <button onclick="renderPhoneApp()" style="padding:14px 40px;border-radius:28px;border:none;background:#ff3b30;color:#fff;font-size:14px;cursor:pointer;margin-top:16px;">结束通话</button>
      </div>
    </div>
  `;

  const lines = [
    '您好，这里是 87.9 听众服务中心。',
    '您的身份已验证。欢迎回来，R-879-14。',
    '请输入您的口令以继续。',
  ];

  let lineIndex = 0;
  const msgContainer = document.getElementById('callMessages');
  const statusEl = document.getElementById('callStatus');

  const interval = setInterval(() => {
    if (lineIndex < lines.length) {
      const p = document.createElement('p');
      p.style.cssText = 'color:rgba(255,255,255,0.8);font-size:13px;line-height:1.6;margin-bottom:8px;animation:fadeIn 0.5s ease;';
      p.textContent = lines[lineIndex];
      msgContainer.appendChild(p);
      msgContainer.scrollTop = msgContainer.scrollHeight;
      if (lineIndex === 1) {
        statusEl.textContent = '已接通';
      }
      lineIndex++;
    } else {
      clearInterval(interval);
      document.getElementById('passwordArea').style.display = 'block';
      const el = document.getElementById('passwordInput');
      if (el) el.focus();
    }
  }, 1500);
  window._callInterval = interval;
}

function checkCallPassword() {
  const input = document.getElementById('passwordInput');
  const err = document.getElementById('passwordError');
  const msg = document.getElementById('callMessages');
  const pwArea = document.getElementById('passwordArea');
  const pwd = input.value.trim();

  if (pwd === '服从电台') {
    err.textContent = '';
    if (!GameState.foundClues.includes('phone_call_made')) {
      GameState.foundClues.push('phone_call_made');
      GameState.save();
    }
    if (GameState.gamePhase < 2) {
      GameState.gamePhase = 2;
      GameState.save();
    }
    pwArea.style.display = 'none';

    const lines = [
      '✓ 口令正确。',
      '您的专属访问地址：',
      'radio879.com',
      '在网站上可查询听众信息、搜索相关资料。',
      '愿频率与你同在。再会。',
    ];

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        const p = document.createElement('p');
        let style = 'color:rgba(255,255,255,0.8);font-size:13px;line-height:1.6;margin-bottom:8px;animation:fadeIn 0.5s ease;';
        if (lineIndex === 0) {
          style = 'color:#34c759;font-size:13px;line-height:1.6;margin-bottom:8px;animation:fadeIn 0.5s ease;';
        } else if (lineIndex === 2) {
          style = 'color:#ffcc00;font-size:16px;font-family:monospace;letter-spacing:2px;margin-bottom:8px;animation:fadeIn 0.5s ease;';
        }
        p.style.cssText = style;
        p.textContent = lines[lineIndex];
        msg.appendChild(p);
        msg.scrollTop = msg.scrollHeight;
        lineIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1200);
  } else {
    err.textContent = '口令错误。请重试。';
    input.value = '';
    input.focus();
  }
}

function showCallScreen(number, status, lines) {
  let lineIndex = 0;
  document.getElementById('screenContent').innerHTML = `
    <div class="app-view">
      <div class="app-header">
        <button class="back-btn" onclick="renderPhoneApp()">←</button>
        <span class="app-title">通话中</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:32px 24px;text-align:center;">
        <div style="font-size:28px;font-weight:300;color:#fff;margin-bottom:8px;">${number}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:24px;" id="callStatus">${status}</div>
        <div style="flex:1;width:100%;overflow-y:auto;" id="callMessages"></div>
        <button onclick="renderPhoneApp()" style="padding:14px 40px;border-radius:28px;border:none;background:#ff3b30;color:#fff;font-size:14px;cursor:pointer;margin-top:16px;">结束通话</button>
      </div>
    </div>
  `;

  if (lines.length > 0) {
    const msgContainer = document.getElementById('callMessages');
    const statusEl = document.getElementById('callStatus');

    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        const p = document.createElement('p');
        p.style.cssText = 'color:rgba(255,255,255,0.8);font-size:13px;line-height:1.6;margin-bottom:8px;animation:fadeIn 0.5s ease;';
        p.textContent = lines[lineIndex];
        msgContainer.appendChild(p);
        msgContainer.scrollTop = msgContainer.scrollHeight;
        if (lineIndex === 0) {
          statusEl.textContent = '已接通';
        }
        lineIndex++;
      } else {
        clearInterval(interval);
        statusEl.textContent = '通话结束';
      }
    }, 1500);

    // Store interval for cleanup
    window._callInterval = interval;
  }
}

/* ===== Mail App ===== */
function renderMailApp() {
  let html = `<div class="app-view"><div class="app-header"><button class="back-btn" onclick="goHome()">←</button><span class="app-title">邮件</span></div><div class="mail-list">`;
  const visibleMails = MAIL_DATA.filter(m => m.phase <= GameState.gamePhase);
  visibleMails.forEach((m) => {
    const realIdx = MAIL_DATA.indexOf(m);
    html += `<div class="mail-item" onclick="openMail(${realIdx})">
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

/* ===== Snooping tool removed — functionality moved to website search ===== */
