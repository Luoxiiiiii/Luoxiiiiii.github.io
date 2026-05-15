// js/puzzles.js — puzzle logic

const PUZZLES = [
  {
    id: 'gallery-lock',
    prompt: '相册密码（姐姐的纪念日）',
    answer: '0520',
    reward: { type: 'unlock', target: 'photo:p4' },
  },
  {
    id: 'note-pw',
    prompt: '从哪里到哪里才能找到电台呢....？',
    answer: '935879',
    reward: { type: 'unlock', target: 'note:n4' },
  },
  {
    id: 'note2-pw',
    prompt: '密码存在谁那里了……？',
    answer: 'NIGHT',
    reward: { type: 'unlock', target: 'note:n5' },
  },
];

function checkPuzzleAnswer(puzzleId, answer) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  if (!puzzle) return false;
  const correct = String(answer).trim().toLowerCase() === String(puzzle.answer).trim().toLowerCase();
  if (correct) {
    GameState.puzzleProgress[puzzleId] = 'solved';
    applyPuzzleReward(puzzle.reward);
    GameState.save();
    return true;
  }
  return false;
}

function applyPuzzleReward(reward) {
  if (!reward) return;
  if (reward.type === 'unlock') {
    GameState.unlockedContent[reward.target] = true;
  }
}

function checkAutoPuzzles() {
  // placeholder — no auto puzzles currently
}
