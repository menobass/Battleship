// background.js - Handles background tasks and notifications

// Listen for Hive memos (placeholder)
function listenForHiveMemos() {
  // Dummy: simulate receiving a move after 5 seconds
  setInterval(() => {
    // Random move for demo
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    chrome.runtime.sendMessage({ type: 'opponentMove', x, y });
    showNotification('Hive Battleship', `Opponent fired at (${x + 1}, ${y + 1})!`);
  }, 15000);
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon48.png',
    title,
    message
  });
}

chrome.runtime.onInstalled.addListener(() => {
  listenForHiveMemos();
});

// For hot reload during development
listenForHiveMemos();
