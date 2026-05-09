// js/main.js — app initialization

document.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  renderPhoneShell();

  if (GameState.currentApp) {
    openApp(GameState.currentApp);
  }

  if (GameState.endingTriggered) {
    triggerEnding();
  }
});
