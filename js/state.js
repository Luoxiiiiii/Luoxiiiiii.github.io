// js/state.js — game state management with localStorage persistence

const GAME_VERSION = '2.2';

const GameState = {
  currentApp: null,
  unlockedContent: {},
  foundClues: [],
  searchQueries: [],
  puzzleProgress: {},
  gamePhase: 1,
  readChats: {},
  endingTriggered: false,
  goodEndingTriggered: false,
  fineTuneUnlocked: false,
  memberLoggedIn: false,
  adminLoggedIn: false,
  _currentMember: null,
  _endingCompleted: false,
  _nightWatchCompleted: false,
  _readDiaries: [],
  gameTimeElapsed: 0,
  _savedAccounts: [],
  _radioDailyIndex: 0,
  _lastRadioDate: '',

  save() {
    try {
      localStorage.setItem('gameSave', JSON.stringify({
        _version: GAME_VERSION,
        currentApp: this.currentApp,
        unlockedContent: this.unlockedContent,
        foundClues: this.foundClues,
        searchQueries: this.searchQueries,
        puzzleProgress: this.puzzleProgress,
        gamePhase: this.gamePhase,
        readChats: this.readChats,
        endingTriggered: this.endingTriggered,
        goodEndingTriggered: this.goodEndingTriggered,
        fineTuneUnlocked: this.fineTuneUnlocked,
        memberLoggedIn: this.memberLoggedIn,
        adminLoggedIn: this.adminLoggedIn,
        _currentMember: this._currentMember,
        _endingCompleted: this._endingCompleted,
        _nightWatchCompleted: this._nightWatchCompleted,
        _readDiaries: this._readDiaries,
        gameTimeElapsed: this.gameTimeElapsed,
        _savedAccounts: this._savedAccounts,
        _radioDailyIndex: this._radioDailyIndex,
        _lastRadioDate: this._lastRadioDate,
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
        if (data._version !== GAME_VERSION) {
          this.reset();
          return;
        }
        Object.assign(this, data);
      }
    } catch (e) {
      console.warn('Load failed:', e);
    }
  },

  reset() {
    const hadEnding = this._endingCompleted;
    const hadNightWatch = this._nightWatchCompleted;
    const hadReadDiaries = this._readDiaries;
    const hadPhase = this.gamePhase;
    localStorage.removeItem('gameSave');
    this.currentApp = null;
    this.unlockedContent = {};
    this.foundClues = [];
    this.searchQueries = [];
    this.puzzleProgress = {};
    this.gamePhase = hadPhase > 1 ? hadPhase : 1;
    this.readChats = {};
    this.endingTriggered = false;
    this.goodEndingTriggered = false;
    this.fineTuneUnlocked = false;
    this.memberLoggedIn = false;
    this.adminLoggedIn = false;
    this._currentMember = null;
    this._endingCompleted = hadEnding;
    this._nightWatchCompleted = hadNightWatch;
    this._readDiaries = hadReadDiaries;
    this.save();
  }
};
