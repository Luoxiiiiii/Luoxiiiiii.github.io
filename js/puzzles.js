// js/puzzles.js — puzzle logic

const PUZZLES = [
  {
    id: 'gallery-lock',
    prompt: '相册密码（姐姐的生日，MMDD）',
    answer: '0520',
    reward: { type: 'unlock', target: 'photo:p4' },
  },
  {
    id: 'note-pw',
    prompt: '备忘录密码（提示：纪念日）',
    answer: '0520',
    reward: { type: 'unlock', target: 'note:n4' },
  },
  {
    id: 'snoop-unlock',
    type: 'auto',
    condition: () => {
      return GameState.puzzleProgress['gallery-lock'] === 'solved'
          && GameState.puzzleProgress['note-pw'] === 'solved';
    },
    reward: { type: 'snoop_unlock' },
  },
  {
    id: 'final-reveal',
    type: 'auto',
    condition: () => {
      return GameState.gamePhase >= 2
          && GameState.foundClues.includes('snoop_final_trigger');
    },
    reward: { type: 'ending' },
  },
];

function checkPuzzleAnswer(puzzleId, answer) {
  const puzzle = PUZZLES.find(p => p.id === puzzleId);
  if (!puzzle || puzzle.type === 'auto') return false;
  const correct = String(answer).trim() === String(puzzle.answer).trim();
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
  switch (reward.type) {
    case 'unlock':
      GameState.unlockedContent[reward.target] = true;
      break;
    case 'snoop_unlock':
      GameState.snoopUnlocked = true;
      GameState.foundClues.push('snoop_unlocked');
      GameState.gamePhase = 2;
      break;
    case 'ending':
      if (typeof triggerEnding === 'function') {
        setTimeout(triggerEnding, 1500);
      }
      break;
  }
}

function checkAutoPuzzles() {
  PUZZLES.filter(p => p.type === 'auto').forEach(puzzle => {
    if (GameState.puzzleProgress[puzzle.id] === 'solved') return;
    if (puzzle.condition()) {
      GameState.puzzleProgress[puzzle.id] = 'solved';
      applyPuzzleReward(puzzle.reward);
      GameState.save();
    }
  });
}
