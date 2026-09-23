import { AI_DIFFICULTY, BOARD_CONFIG, COMPUTER_DELAY, CUSTOM_BOARD, GAME_MODE, PLAYER } from './const.js';

export function createGame({ size, mode, difficulty = AI_DIFFICULTY.NORMAL, onStateChange, onRoundEnd }) {
  const numericSize = Number(size);
  const config = BOARD_CONFIG[numericSize] ?? (numericSize >= CUSTOM_BOARD.MIN_SIZE && numericSize <= CUSTOM_BOARD.MAX_SIZE
    ? { size: numericSize, winLength: CUSTOM_BOARD.WIN_LENGTH } : BOARD_CONFIG[3]);
  const board = Array.from({ length: config.size }, () => Array(config.size).fill(null));
  let currentPlayer = PLAYER.X, active = true, computerTimer = null;
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

  const getState = () => ({ board: board.map(row => [...row]), currentPlayer, active, size: config.size, mode, difficulty });
  const emitState = () => onStateChange?.(getState());
  const isInside = (r, c) => r >= 0 && r < config.size && c >= 0 && c < config.size;

  function getWinningCells(row, col, player = board[row][col]) {
    if (!player) return null;
    for (const [dr, dc] of directions) {
      const cells = [[row, col]];
      for (const sign of [1, -1]) for (let d = 1; d < config.winLength; d += 1) {
        const r = row + dr * d * sign, c = col + dc * d * sign;
        if (!isInside(r, c) || board[r][c] !== player) break;
        cells.push([r, c]);
      }
      if (cells.length >= config.winLength) return cells;
    }
    return null;
  }

  const isDraw = () => board.every(row => row.every(Boolean));
  function finishRound(result, winningCells = []) { active = false; emitState(); onRoundEnd?.({ result, winningCells }); }
  function placeMove(row, col) {
    if (!active || !isInside(row, col) || board[row][col]) return false;
    board[row][col] = currentPlayer;
    const winningCells = getWinningCells(row, col);
    if (winningCells) { finishRound(currentPlayer, winningCells); return true; }
    if (isDraw()) { finishRound('draw'); return true; }
    currentPlayer = currentPlayer === PLAYER.X ? PLAYER.O : PLAYER.X; emitState(); return true;
  }

  function emptyCells() {
    const cells = [];
    for (let r = 0; r < config.size; r += 1) for (let c = 0; c < config.size; c += 1) if (!board[r][c]) cells.push({ row: r, col: c });
    return cells;
  }
  function randomMove(cells = emptyCells()) { return cells[Math.floor(Math.random() * cells.length)] ?? null; }
  function findImmediateMove(player) {
    for (const cell of emptyCells()) {
      board[cell.row][cell.col] = player;
      const wins = Boolean(getWinningCells(cell.row, cell.col, player)); board[cell.row][cell.col] = null;
      if (wins) return cell;
    }
    return null;
  }

  function linePotential(row, col, player) {
    let total = 0;
    for (const [dr, dc] of directions) {
      let connected = 1, openEnds = 0;
      for (const sign of [1, -1]) {
        let r = row + dr * sign, c = col + dc * sign;
        while (isInside(r, c) && board[r][c] === player) { connected += 1; r += dr * sign; c += dc * sign; }
        if (isInside(r, c) && !board[r][c]) openEnds += 1;
      }
      if (connected >= config.winLength) total += 100000;
      else total += Math.pow(8, connected - 1) * (openEnds === 2 ? 2.5 : openEnds === 1 ? 1 : 0.1);
    }
    return total;
  }

  function scoreCandidate(row, col, hard = false) {
    const center = (config.size - 1) / 2;
    let score = config.size - (Math.abs(row - center) + Math.abs(col - center));
    if (hard) {
      board[row][col] = PLAYER.O; const attack = linePotential(row, col, PLAYER.O); board[row][col] = null;
      board[row][col] = PLAYER.X; const defense = linePotential(row, col, PLAYER.X); board[row][col] = null;
      score += attack * 1.15 + defense;
    } else {
      for (const [dr, dc] of directions) for (const sign of [1, -1]) {
        const r = row + dr * sign, c = col + dc * sign;
        if (isInside(r, c)) { if (board[r][c] === PLAYER.O) score += 3; if (board[r][c] === PLAYER.X) score += 2; }
      }
    }
    return score + Math.random() * (hard ? 0.05 : 0.5);
  }

  function chooseComputerMove() {
    const cells = emptyCells();
    if (!cells.length) return null;
    if (difficulty === AI_DIFFICULTY.EASY) {
      if (Math.random() < 0.35) return findImmediateMove(PLAYER.O) ?? findImmediateMove(PLAYER.X) ?? randomMove(cells);
      return randomMove(cells);
    }
    const forced = findImmediateMove(PLAYER.O) ?? findImmediateMove(PLAYER.X);
    if (forced) return forced;
    const hard = difficulty === AI_DIFFICULTY.HARD;
    return cells.map(cell => ({ ...cell, score: scoreCandidate(cell.row, cell.col, hard) })).sort((a, b) => b.score - a.score)[0];
  }

  function makeComputerMove() { if (active && mode === GAME_MODE.VS_COMPUTER && currentPlayer === PLAYER.O) { const move = chooseComputerMove(); if (move) placeMove(move.row, move.col); } }
  function play(row, col) {
    if (!active || (mode === GAME_MODE.VS_COMPUTER && currentPlayer === PLAYER.O)) return false;
    const moved = placeMove(row, col);
    if (moved && active && mode === GAME_MODE.VS_COMPUTER && currentPlayer === PLAYER.O) computerTimer = window.setTimeout(makeComputerMove, COMPUTER_DELAY);
    return moved;
  }
  function destroy() { if (computerTimer) window.clearTimeout(computerTimer); active = false; }
  emitState(); return { play, destroy, getState };
}
