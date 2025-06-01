// game.js - Core game logic and board generation

const BOARD_SIZE = 10;
const SHIP_SIZES = [5, 4, 3, 3, 2]; // Carrier, Battleship, Cruiser, Submarine, Destroyer

// Deterministic PRNG using seed
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Generate a board with ships placed deterministically from a seed
function generateBoard(seed) {
  const rand = mulberry32(hashCode(seed));
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  for (let size of SHIP_SIZES) {
    let placed = false;
    while (!placed) {
      const vertical = rand() > 0.5;
      const x = Math.floor(rand() * (vertical ? BOARD_SIZE : BOARD_SIZE - size + 1));
      const y = Math.floor(rand() * (vertical ? BOARD_SIZE - size + 1 : BOARD_SIZE));
      let fits = true;
      for (let i = 0; i < size; i++) {
        const xi = x + (vertical ? 0 : i);
        const yi = y + (vertical ? i : 0);
        if (board[yi][xi] !== 0) { fits = false; break; }
      }
      if (fits) {
        for (let i = 0; i < size; i++) {
          const xi = x + (vertical ? 0 : i);
          const yi = y + (vertical ? i : 0);
          board[yi][xi] = 1;
        }
        placed = true;
      }
    }
  }
  return board;
}

// Simple string hash for seeding
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Exported for use in popup.js
window.HiveBattleshipGame = {
  BOARD_SIZE,
  generateBoard,
};
