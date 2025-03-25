const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset');
const difficultyButtons = document.querySelectorAll('.bot-choice');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const winnerText = document.getElementById('winner');
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let aiDifficulty = 'medium';
let aiName = 'SHADOW';

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        aiDifficulty = button.getAttribute('data-difficulty');
        if (aiDifficulty === 'easy') {
            aiName = 'BUN';
        } else if (aiDifficulty === 'medium') {
            aiName = 'SHADOW';
        } else if (aiDifficulty === 'hard') {
            aiName = 'FLAP';
        }
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        resetGame();
    });
});

function checkWinner(board) {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

function checkDraw(board) {
    return !board.includes('');
}

function endGame(winner) {
    cells.forEach(cell => cell.removeEventListener('click', handleClick));

    if (winner) {
        winnerText.textContent = `${winner === 'X' ? 'YOU' : aiName} WON!`;
        highlightWinner(winner);
    } else {
        winnerText.textContent = 'IT\'S A DRAW!';
        setTimeout(() => {
            resetGame();
        }, 3000);
    }
}

function highlightWinner(winner) {
    winningCombinations.forEach(combo => {
        const [a, b, c] = combo;
        if (gameBoard[a] === winner && gameBoard[b] === winner && gameBoard[c] === winner) {
            cells[a].style.backgroundColor = 'green';
            cells[b].style.backgroundColor = 'green';
            cells[c].style.backgroundColor = 'green';
        } else {
            if (gameBoard[a] && gameBoard[a] !== winner) cells[a].style.backgroundColor = 'red';
            if (gameBoard[b] && gameBoard[b] !== winner) cells[b].style.backgroundColor = 'red';
            if (gameBoard[c] && gameBoard[c] !== winner) cells[c].style.backgroundColor = 'red';
        }
    });
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    if (winner === 'X') return -10 + depth;
    if (winner === 'O') return 10 - depth;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = '';
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = '';
            }
        }
        return best;
    }
}

function easyAiMove() {
    let availableMoves = [];
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            availableMoves.push(i);
        }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function mediumAiMove() {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameBoard[a] === 'O' && gameBoard[b] === 'O' && gameBoard[c] === '') return c;
        if (gameBoard[a] === 'O' && gameBoard[c] === 'O' && gameBoard[b] === '') return b;
        if (gameBoard[b] === 'O' && gameBoard[c] === 'O' && gameBoard[a] === '') return a;
    }

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameBoard[a] === 'X' && gameBoard[b] === 'X' && gameBoard[c] === '') return c;
        if (gameBoard[a] === 'X' && gameBoard[c] === 'X' && gameBoard[b] === '') return b;
        if (gameBoard[b] === 'X' && gameBoard[c] === 'X' && gameBoard[a] === '') return a;
    }

    return easyAiMove();
}

function hardAiMove() {
    let bestMove = -1;
    let bestValue = -Infinity;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let moveValue = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function aiMove() {
    let bestMove = -1;

    if (aiDifficulty === 'easy') {
        bestMove = easyAiMove();
    } else if (aiDifficulty === 'medium') {
        bestMove = mediumAiMove();
    } else if (aiDifficulty === 'hard') {
        bestMove = hardAiMove();
    }

    if (bestMove !== -1 && gameBoard[bestMove] === '') {
        gameBoard[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
        cells[bestMove].style.pointerEvents = 'none';
    }
}

function handleClick(event) {
    const index = Array.from(cells).indexOf(event.target);

    if (gameBoard[index] === '' && currentPlayer === 'X') {
        gameBoard[index] = 'X';
        event.target.textContent = 'X';
        event.target.style.pointerEvents = 'none';

        const winner = checkWinner(gameBoard);
        if (winner) {
            endGame(winner);
        } else {
            if (checkDraw(gameBoard)) {
                endGame(null);
            } else {
                currentPlayer = 'O';
                setTimeout(() => {
                    aiMove();
                    const aiWinner = checkWinner(gameBoard);
                    if (aiWinner) {
                        endGame(aiWinner);
                    } else if (checkDraw(gameBoard)) {
                        endGame(null);
                    } else {
                        currentPlayer = 'X';
                    }
                }, 1000);
            }
        }
    }
}

function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    cells.forEach(cell => {
        cell.textContent = '';
        cell.style.backgroundColor = '#fff';
        cell.style.pointerEvents = 'auto';
    });
    winnerText.textContent = '';
    currentPlayer = 'X';
    cells.forEach(cell => cell.addEventListener('click', handleClick));
}

resetButton.addEventListener('click', resetGame);

const backButton = document.getElementById('back-to-start');
backButton.addEventListener('click', () => {
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
    resetGame();
});

cells.forEach(cell => cell.addEventListener('click', handleClick));