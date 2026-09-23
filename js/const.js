export const GAME_MODE = Object.freeze({
  VS_COMPUTER: 'computer',
  VS_PLAYER: 'player'
});

export const PLAYER = Object.freeze({
  X: 'X',
  O: 'O'
});

export const BOARD_CONFIG = Object.freeze({
  3: { size: 3, winLength: 3 },
  5: { size: 5, winLength: 5 }
});

export const CUSTOM_BOARD = Object.freeze({
  MIN_SIZE: 6,
  MAX_SIZE: 10,
  WIN_LENGTH: 5
});

export const AI_DIFFICULTY = Object.freeze({
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard'
});

export const COMPUTER_DELAY = 420;
