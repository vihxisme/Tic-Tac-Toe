import { AI_DIFFICULTY, BOARD_CONFIG, CUSTOM_BOARD, GAME_MODE, PLAYER } from './const.js';
import { createGame } from './logicGame.js';

export function initDOM() {
  const elements = {
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    startButton: document.getElementById('start-game-btn'),
    backButton: document.getElementById('back-btn'),
    restartButton: document.getElementById('restart-btn'),
    playAgainButton: document.getElementById('play-again-btn'),
    sizeButtons: [...document.querySelectorAll('.board-size-option')],
    modeButtons: [...document.querySelectorAll('.board-mode-option')],
    difficultyGroup: document.getElementById('difficulty-group'),
    difficultyButtons: [...document.querySelectorAll('.difficulty-option')],
    customSizeOption: document.getElementById('custom-size-option'),
    customSizeControl: document.getElementById('custom-size-control'),
    customSizeInput: document.getElementById('custom-size-input'),
    customSizeValue: document.getElementById('custom-size-value'),
    board: document.getElementById('board'),
    modeLabel: document.getElementById('mode-label'),
    turnIndicator: document.getElementById('turn-indicator'),
    turnSymbol: document.getElementById('turn-symbol'),
    turnTitle: document.getElementById('turn-title'),
    turnSubtitle: document.getElementById('turn-subtitle'),
    gameMessage: document.getElementById('game-message'),
    resultText: document.getElementById('result-text'),
    scoreX: document.getElementById('score-x'),
    scoreO: document.getElementById('score-o'),
    scoreDraw: document.getElementById('score-draw')
  };

  let selectedSize = 3;
  let selectedMode = GAME_MODE.VS_COMPUTER;
  let selectedDifficulty = AI_DIFFICULTY.NORMAL;
  let game = null;
  let scores = { X: 0, O: 0, draw: 0 };

  function setSelected(buttons, selectedButton) {
    buttons.forEach(button => {
      const selected = button === selectedButton;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function updateScoreboard() {
    elements.scoreX.textContent = scores.X;
    elements.scoreO.textContent = scores.O;
    elements.scoreDraw.textContent = scores.draw;
  }

  function renderBoard(state) {
    elements.board.style.setProperty('--board-size', state.size);
    elements.board.classList.toggle('board-large', state.size === 5);
    elements.board.classList.toggle('board-custom', state.size > 5);

    if (elements.board.children.length !== state.size * state.size) {
      elements.board.replaceChildren();
      for (let row = 0; row < state.size; row += 1) {
        for (let col = 0; col < state.size; col += 1) {
          const cell = document.createElement('button');
          cell.type = 'button';
          cell.className = 'cell';
          cell.dataset.row = row;
          cell.dataset.col = col;
          cell.setAttribute('role', 'gridcell');
          cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);
          elements.board.appendChild(cell);
        }
      }
    }

    [...elements.board.children].forEach(cell => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const value = state.board[row][col];
      cell.textContent = value ?? '';
      cell.classList.toggle('x', value === PLAYER.X);
      cell.classList.toggle('o', value === PLAYER.O);
      cell.disabled = Boolean(value) || !state.active || (state.mode === GAME_MODE.VS_COMPUTER && state.currentPlayer === PLAYER.O);
    });
  }

  function renderTurn(state) {
    const computerThinking = state.mode === GAME_MODE.VS_COMPUTER && state.currentPlayer === PLAYER.O && state.active;
    elements.turnSymbol.textContent = state.currentPlayer;
    elements.turnIndicator.classList.toggle('x-turn', state.currentPlayer === PLAYER.X);
    elements.turnIndicator.classList.toggle('o-turn', state.currentPlayer === PLAYER.O);

    if (!state.active) return;

    if (computerThinking) {
      elements.turnTitle.textContent = 'Computer is thinking…';
      elements.turnSubtitle.textContent = 'O is choosing a move.';
    } else if (state.mode === GAME_MODE.VS_COMPUTER) {
      elements.turnTitle.textContent = 'Your turn';
      elements.turnSubtitle.textContent = 'Choose an empty square.';
    } else {
      elements.turnTitle.textContent = `Player ${state.currentPlayer}'s turn`;
      elements.turnSubtitle.textContent = 'Choose an empty square.';
    }
  }

  function handleStateChange(state) {
    renderBoard(state);
    renderTurn(state);
  }

  function handleRoundEnd({ result, winningCells }) {
    if (result === 'draw') {
      scores.draw += 1;
      elements.resultText.textContent = "It's a draw!";
    } else {
      scores[result] += 1;
      const label = selectedMode === GAME_MODE.VS_COMPUTER
        ? (result === PLAYER.X ? 'You win!' : 'Computer wins!')
        : `Player ${result} wins!`;
      elements.resultText.textContent = label;
    }

    updateScoreboard();
    winningCells.forEach(([row, col]) => {
      elements.board.querySelector(`[data-row="${row}"][data-col="${col}"]`)?.classList.add('winner');
    });
    elements.gameMessage.classList.remove('hidden');
  }

  function startRound() {
    game?.destroy();
    elements.gameMessage.classList.add('hidden');
    elements.board.replaceChildren();
    elements.modeLabel.textContent = selectedMode === GAME_MODE.VS_COMPUTER ? 'Vs Computer' : 'Two Players';
    game = createGame({
      size: selectedSize,
      mode: selectedMode,
      difficulty: selectedDifficulty,
      onStateChange: handleStateChange,
      onRoundEnd: handleRoundEnd
    });
  }

  function enterGame() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreboard();
    elements.startScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    startRound();
  }

  function leaveGame() {
    game?.destroy();
    game = null;
    elements.gameScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
  }

  elements.sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedSize = button.dataset.custom === 'true'
        ? Number(elements.customSizeInput.value)
        : Number(button.dataset.size);
      setSelected(elements.sizeButtons, button);
      elements.customSizeControl.classList.toggle('hidden', button.dataset.custom !== 'true');
    });
  });

  elements.customSizeInput.addEventListener('input', () => {
    const size = Math.min(CUSTOM_BOARD.MAX_SIZE, Math.max(CUSTOM_BOARD.MIN_SIZE, Number(elements.customSizeInput.value)));
    selectedSize = size;
    elements.customSizeOption.dataset.size = String(size);
    elements.customSizeValue.textContent = `${size} × ${size}`;
  });

  elements.modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedMode = button.dataset.mode;
      setSelected(elements.modeButtons, button);
      elements.difficultyGroup.classList.toggle('hidden', selectedMode !== GAME_MODE.VS_COMPUTER);
    });
  });

  elements.difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedDifficulty = button.dataset.difficulty;
      setSelected(elements.difficultyButtons, button);
    });
  });

  elements.startButton.addEventListener('click', enterGame);
  elements.restartButton.addEventListener('click', startRound);
  elements.playAgainButton.addEventListener('click', startRound);
  elements.backButton.addEventListener('click', leaveGame);

  elements.board.addEventListener('click', event => {
    const cell = event.target.closest('.cell');
    if (!cell || !game) return;
    game.play(Number(cell.dataset.row), Number(cell.dataset.col));
  });

  window.addEventListener('keydown', event => {
    if (event.key.toLowerCase() === 'r' && !elements.gameScreen.classList.contains('hidden')) startRound();
    if (event.key === 'Escape' && !elements.gameScreen.classList.contains('hidden')) leaveGame();
  });

  // Keep the config import meaningful and fail early if the default option disappears.
  if (!BOARD_CONFIG[selectedSize]) selectedSize = 3;
}
