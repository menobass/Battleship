// popup.js - Handles UI, player input, and communication

window.addEventListener('DOMContentLoaded', () => {
  // Get all DOM elements
  const { BOARD_SIZE, generateBoard } = window.HiveBattleshipGame;
  const loginScreen = document.getElementById('loginScreen');
  const mainScreen = document.getElementById('mainScreen');
  const challengeScreen = document.getElementById('challengeScreen');
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const cellSize = canvas.width / BOARD_SIZE;
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const usernameInput = document.getElementById('usernameInput');
  const userDisplay = document.getElementById('userDisplay');
  const challengeBtn = document.getElementById('challengeBtn');
  const opponentInput = document.getElementById('opponentInput');
  const sendChallengeBtn = document.getElementById('sendChallengeBtn');
  const cancelChallengeBtn = document.getElementById('cancelChallengeBtn');
  const challengeStatus = document.getElementById('challengeStatus');
  const logDiv = document.getElementById('log');

  // App/game state
  let gameSeed = 'default-seed';
  let playerBoard = null;
  let shotsFired = [];
  let hits = [];
  let isPlayerTurn = true;

  // --- UI State Management ---
  function showScreen(screen) {
    loginScreen.style.display = screen === 'login' ? 'block' : 'none';
    mainScreen.style.display = screen === 'main' ? 'block' : 'none';
    challengeScreen.style.display = screen === 'challenge' ? 'block' : 'none';
  }

  // --- Game/Board Logic ---
  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#333';
    for (let i = 0; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (playerBoard && playerBoard[y][x] === 1) {
          ctx.fillStyle = '#111';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
    for (let shot of shotsFired) {
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.arc(
        shot.x * cellSize + cellSize / 2,
        shot.y * cellSize + cellSize / 2,
        cellSize / 3, 0, 2 * Math.PI
      );
      ctx.stroke();
    }
    for (let hit of hits) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(
        hit.x * cellSize + cellSize / 2,
        hit.y * cellSize + cellSize / 2,
        cellSize / 4, 0, 2 * Math.PI
      );
      ctx.fill();
    }
  }

  function log(msg, clear = false) {
    if (clear) logDiv.textContent = '';
    logDiv.textContent += msg + '\n';
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  function generateSeed() {
    return 'hive-battleship-' + Date.now() + '-' + Math.floor(Math.random() * 1e8);
  }

  // --- Game State ---
  function startNewGame() {
    gameSeed = generateSeed();
    playerBoard = generateBoard(gameSeed + '-player');
    shotsFired = [];
    hits = [];
    isPlayerTurn = true;
    drawBoard();
    log('New game started. Seed: ' + gameSeed, true);
  }

  // --- Login/Logout ---
  function saveUsername(username) {
    localStorage.setItem('hiveBattleshipUser', username);
  }
  function getUsername() {
    return localStorage.getItem('hiveBattleshipUser');
  }
  function logout() {
    localStorage.removeItem('hiveBattleshipUser');
    showScreen('login');
  }

  // --- Challenge Flow ---
  function showChallengeScreen() {
    showScreen('challenge');
    opponentInput.value = '';
    challengeStatus.textContent = '';
  }
  function hideChallengeScreen() {
    showScreen('main');
  }
  function sendChallenge() {
    const opponent = opponentInput.value.trim().replace(/^@/, '');
    const user = getUsername();
    if (!opponent) {
      challengeStatus.textContent = 'Please enter an opponent username.';
      return;
    }
    if (!user) {
      challengeStatus.textContent = 'You must be logged in.';
      return;
    }
    const memo = `I declare war to you @${opponent}, do you accept?\nSeed: ${gameSeed}`;
    // Open a small popup window for Keychain action
    const url = `keychain-action.html?from=${encodeURIComponent(user)}&to=${encodeURIComponent(opponent)}&memo=${encodeURIComponent(memo)}&amount=0.01&currency=HBD`;
    window.open(url, 'keychainAction', 'width=400,height=300,menubar=no,toolbar=no,location=no,status=no');
    challengeStatus.textContent = 'Please confirm the action in the new window...';
    setTimeout(hideChallengeScreen, 2000);
  }

  // --- Event Listeners ---
  loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim().replace(/^@/, '');
    if (username) {
      saveUsername(username);
      userDisplay.textContent = 'Logged in as: ' + username;
      showScreen('main');
      startNewGame();
    }
  });
  logoutBtn.addEventListener('click', logout);
  challengeBtn.addEventListener('click', showChallengeScreen);
  sendChallengeBtn.addEventListener('click', sendChallenge);
  cancelChallengeBtn.addEventListener('click', hideChallengeScreen);
  canvas.addEventListener('click', function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    fireShot(x, y);
  });

  // --- Initial Screen ---
  const storedUser = getUsername();
  if (storedUser) {
    userDisplay.textContent = 'Logged in as: ' + storedUser;
    showScreen('main');
    startNewGame();
  } else {
    showScreen('login');
  }
});

// Dummy: Listen for move memos from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'opponentMove') {
    receiveMoveMemo(message.x, message.y);
  }
});
