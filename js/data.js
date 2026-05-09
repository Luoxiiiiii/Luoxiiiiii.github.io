// js/data.js — all game content data

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
        { id: 'u6', from: 'unknown', text: '你在查什么？', time: { day: null, night: '23:50' }, phase: 2 },
        { id: 'u7', from: 'me', text: '没什么。', time: { day: null, night: '23:51' }, phase: 2 },
      ]
    },
    {
      id: 'bestie',
      name: '小琳 ❤️',
      messages: [
        { id: 'b1', from: 'bestie', text: '你最近睡得好吗？', time: { day: '14:32', night: null }, phase: 1 },
        { id: 'b2', from: 'me', text: '还行吧', time: { day: '14:33', night: null }, phase: 1 },
        { id: 'b3', from: 'bestie', text: '你黑眼圈好重…要不要出来走走？', time: { day: '14:34', night: null }, phase: 1 },
        { id: 'b4', from: 'bestie', text: '小敏？你最近回消息好慢', time: { day: '10:00', night: null }, phase: 2 },
        { id: 'b5', from: 'me', text: '最近有点累', time: { day: '18:30', night: null }, phase: 2 },
      ]
    },
    {
      id: 'mom',
      name: '妈妈',
      messages: [
        { id: 'm1', from: 'mom', text: '周末回不回家吃饭？', time: { day: '10:00', night: null }, phase: 1 },
        { id: 'm2', from: 'me', text: '再说吧', time: { day: '10:05', night: null }, phase: 1 },
        { id: 'm3', from: 'mom', text: '你姐最近怪怪的，你们聊过吗？', time: { day: '09:30', night: null }, phase: 2 },
      ]
    },
    {
      id: 'mystery',
      name: '神秘人X',
      messages: [
        { id: 'x1', from: 'mystery', text: '步骤三完成了？', time: { day: null, night: '01:30' }, phase: 2 },
        { id: 'x2', from: 'me', text: '完成了。', time: { day: null, night: '01:31' }, phase: 2 },
        { id: 'x3', from: 'mystery', text: '她醒了会忘记一切。这就是代价。', time: { day: null, night: '01:32' }, phase: 2 },
        { id: 'x4', from: 'mystery', text: '你已经陷得太深了。', time: { day: null, night: '02:00' }, phase: 3 },
      ]
    },
    {
      id: 'colleague',
      name: '工作群(3)',
      messages: [
        { id: 'c1', from: 'colleague', text: '小敏你今天开会怎么一直走神', time: { day: '09:15', night: null }, phase: 1 },
        { id: 'c2', from: 'me', text: '抱歉 昨晚没睡好', time: { day: '09:16', night: null }, phase: 1 },
      ]
    }
  ]
};

const RADIO_DATA = {
  currentFrequency: 87.0,
  minFreq: 87.0,
  maxFreq: 108.0,
  specialFrequency: 87.9,
  nightContent: [
    { id: 'r1', text: '……放松……深呼吸……你感到困倦……', phase: 1 },
    { id: 'r2', text: '你听到我的声音了……跟随它……', phase: 1 },
    { id: 'r3', text: '白天的一切都是噪音……只有夜晚是真实的……', phase: 2 },
    { id: 'r4', text: '你也在听，不是吗？我知道你在。', phase: 2 },
    { id: 'r5', text: '她已经完成了她的部分。现在轮到你了。', phase: 3 },
  ],
  listeningHistory: [
    { freq: '87.9', date: '05/06', time: '23:30' },
    { freq: '87.9', date: '05/07', time: '00:15' },
    { freq: '87.9', date: '05/07', time: '23:45' },
    { freq: '100.3', date: '05/05', time: '14:20' },
    { freq: '87.9', date: '05/08', time: '01:00' },
  ]
};

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
      content: '有人听过87.9吗？\n\n我连续听了三天，现在每天晚上到点就醒。\n\n> 回复1：我也听过！那个女声说的内容我醒来完全不记得。\n\n> 回复2：不要去听。我是认真的。\n\n> 回复3：楼主最近还好吗？\n\n> 回复4：……楼主？\n\n[该帖子已被锁定，无法回复]',
    },
    hypno: {
      title: '催眠引导 · 睡前放松',
      content: '欢迎来到催眠引导。\n\n请找一个安静的环境，深呼吸……\n放松你的身体……\n\n[音频播放按钮]\n\n---\n合作电台：FM 87.9 MHz\n---',
    },
  }
};

const GALLERY_DATA = [
  { id: 'p1', src: '', caption: '自拍 · 05/06', locked: false },
  { id: 'p2', src: '', caption: '窗外 · 23:47 — 对面楼有亮灯的窗户', locked: false },
  { id: 'p3', src: '', caption: '屏幕截图 · 00:12 — 电台界面', locked: false },
  { id: 'p4', src: '', caption: '???', locked: true, puzzleId: 'gallery-lock' },
];

const NOTES_DATA = [
  { id: 'n1', title: '备忘', text: '买菜\n洗衣\n——\n今晚不要忘了听。', locked: false },
  { id: 'n2', title: '…', text: '她说87.9这个频率很有用。183**** 也是她给的。', locked: false },
  { id: 'n3', title: '密码提示', text: '我们的纪念日。。。是五月二十日吗？', locked: false },
  { id: 'n4', title: '加密日记', text: '需要密码', locked: true, puzzleId: 'note-pw' },
];

const CALLLOG_DATA = [
  { contact: '未知号码', type: '拨出', time: '23:45', date: '05/06', duration: '0:32' },
  { contact: '未知号码', type: '拨出', time: '00:10', date: '05/07', duration: '1:15' },
  { contact: '未知号码', type: '拨出', time: '23:50', date: '05/07', duration: '0:45' },
  { contact: '小琳', type: '拨入', time: '14:30', date: '05/07', duration: '3:20' },
  { contact: '未知号码', type: '拨出', time: '01:20', date: '05/08', duration: '5:00' },
];

const MAIL_DATA = [
  { from: 'noreply@radio879.com', subject: '欢迎加入 87.9 听众群', body: '亲爱的听众：\n感谢你收听 87.9 MHz。\n你的专属收听代码：R-879-14\n\n每晚23:00，我们等你。', phase: 1 },
  { from: 'system@notify.com', subject: '您的iCloud存储空间不足', body: '请升级您的存储空间以继续使用iCloud备份。', phase: 1 },
  { from: 'unknown@temp.com', subject: 'RE: 你的问题', body: '你问的那个频率……不要再查了。\n有些人有些事，不知道比较好。', phase: 2 },
];
