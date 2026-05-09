// js/state.js — game state management with localStorage persistence

const GameState = {
  currentApp: null,
  timeOfDay: 'day',
  unlockedContent: {},
  foundClues: [],
  snoopQueries: [],
  puzzleProgress: {},
  gamePhase: 1,
  endingTriggered: false,
  snoopUnlocked: false,

  save() {
    try {
      localStorage.setItem('gameSave', JSON.stringify({
        currentApp: this.currentApp,
        timeOfDay: this.timeOfDay,
        unlockedContent: this.unlockedContent,
        foundClues: this.foundClues,
        snoopQueries: this.snoopQueries,
        puzzleProgress: this.puzzleProgress,
        gamePhase: this.gamePhase,
        endingTriggered: this.endingTriggered,
        snoopUnlocked: this.snoopUnlocked,
      }));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const saved = localStorage.getItem('gameSave');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this, data);
      }
    } catch (e) {
      console.warn('Load failed:', e);
    }
  },

  reset() {
    localStorage.removeItem('gameSave');
    this.currentApp = null;
    this.timeOfDay = 'day';
    this.unlockedContent = {};
    this.foundClues = [];
    this.snoopQueries = [];
    this.puzzleProgress = {};
    this.gamePhase = 1;
    this.endingTriggered = false;
    this.snoopUnlocked = false;
    this.save();
  }
};
