// js/main.js — app initialization

document.addEventListener('DOMContentLoaded', () => {
  GameState.load();
  renderPhoneShell();
  if (GameState.endingTriggered) {
    // Ending will be handled when ending.js is implemented
  }
});
