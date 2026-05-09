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
