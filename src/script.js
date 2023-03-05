import "./index.html";
import "../main.css";

const cells = [];
const ROWS = 16;
const COLS = 16;
const MINES = 40;

let minePositions = [];
let gameInProgress = false;
let remainingCells = ROWS * COLS - MINES;
let minesCounter = MINES;
let timerIntervalId = null;
let elapsedTime = 0;

const startButton = document.querySelector(".smile");
const board = document.querySelector(".board");

function gameStart() {
    initBoard();
    placeMines();
    initCells();
    listeners();
    updateMinesCounter();
    resetTimer();
}

gameStart();

startButton.addEventListener("click", gameStart);

function initBoard() {
    board.innerHTML = "";
    cells.length = 0;
    minePositions = [];
    gameInProgress = true;
    remainingCells = ROWS * COLS - MINES;
    startButton.className = "smile";
    startButton.classList.add("smile-good");

    for (let row = 0; row < ROWS; row++) {
        cells[row] = [];
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");

            cell.className = "cell";
            cell.classList.add("hidden");
            cell.setAttribute("data-row", row);
            cell.setAttribute("data-col", col);
            cell.status = "hidden";
            cell.onclick = handleClick;
            cell.oncontextmenu = handleRightClick;

            board.appendChild(cell);
            cells[row][col] = cell;
        }
    }
}

function initCells() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = cells[row][col];
            if (cell.status !== "mine") {
                const count = countNearbyMines(row, col);
                cell.setAttribute("data-nearby-mines", count);
            } else {
                cell.setAttribute("data-mine", "true");
            }
        }
    }
}

function listeners() {
    const allCells = document.querySelectorAll('.cell');
    for (let i = 0; i < allCells.length; i++) {
        allCells[i].addEventListener("mousedown", (event) => {
            if (gameInProgress) {
                startButton.classList.remove("smile-good");
                startButton.classList.add("smile-shocked");
            }
        });
        allCells[i].addEventListener("mouseup", (event) => {
            if (gameInProgress) {
                startButton.classList.remove("smile-shocked");
                startButton.classList.add("smile-good");
            }
        });
    }

    let isFirstClick = true;
    board.addEventListener('click', () => {
        if (isFirstClick) {
            startTimer();
            isFirstClick = false;
            if(!gameInProgress){
                gameEnd(false);
            }
        }
    });

    board.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        startButton.className = ("smile smile-good");
        if (isFirstClick) {
            startTimer();
            isFirstClick = false;
        }
    });
}

function placeMines() {
    for (let i = 0; i < MINES; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * ROWS);
            col = Math.floor(Math.random() * COLS);
        } while (cells[row][col].status === "mine");
        cells[row][col].status = "mine";
        minePositions.push([row, col]);
    }
}

function revealCell(row, col) {
    const cell = cells[row]?.[col];

    if (!cell || cell.status === "flag" || cell.status === "revealed" || !gameInProgress) {
        return;
    }

    if (remainingCells === 0 || !gameInProgress) {
        stopTimer();
    }

    cell.status = "revealed";
    cell.classList.remove("hidden");

    if (cell.getAttribute("data-mine") === "true") {
        cell.classList.remove("revealed");
        cell.status = "mine";
        cell.classList.add("mine-red");
        revealAllMines();
        gameInProgress = false;
        gameEnd(false);

    } else if (cell.getAttribute("data-nearby-mines") !== "0") {
        cell.classList.add(`cell-number-${cell.getAttribute("data-nearby-mines")}`);

    } else {
        const nearbyCells = getNearbyCells(row, col);
        for (let i = 0; i < nearbyCells.length; i++) {
            const [nearbyRow, nearbyCol] = nearbyCells[i];
            revealCell(nearbyRow, nearbyCol);
        }
    }
    remainingCells--;

    if (remainingCells === 0) {
        gameEnd(true);
    }
}

function gameEnd(didWin) {
    const smile = document.querySelector('.smile');
    if (didWin) {
        revealAllMines();
        smile.classList.remove('smile-good');
        smile.classList.add('smile-win');
    } else {
        revealAllMines();
        smile.classList.remove("smile-good");
        smile.classList.add("smile-lose");
    }
    gameInProgress = false;
    stopTimer();
}

function revealAllMines() {
    for (let i = 0; i < minePositions.length; i++) {
        const [row, col] = minePositions[i];
        const cell = cells[row][col];
        if (cell.status !== "revealed") {
            cell.classList.add("revealed");
        }
        if (cell.status === "flag" && cell.getAttribute("data-mine") === "true") {
            cell.classList.add("mine-flag");
        } else {
            cell.classList.add("mine");
        }
    }
}

function getNearbyCells(row, col) {
    const nearbyCells = [];
    if (row > 0) {
        if (col > 0) nearbyCells.push([row - 1, col - 1]);
        nearbyCells.push([row - 1, col]);
        if (col < COLS - 1) nearbyCells.push([row - 1, col + 1]);
    }
    if (col > 0) nearbyCells.push([row, col - 1]);
    if (col < COLS - 1) nearbyCells.push([row, col + 1]);
    if (row < ROWS - 1) {
        if (col > 0) nearbyCells.push([row + 1, col - 1]);
        nearbyCells.push([row + 1, col]);
        if (col < COLS - 1) nearbyCells.push([row + 1, col + 1]);
    }
    return nearbyCells;
}

function countNearbyMines(row, col) {
    const nearbyCells = getNearbyCells(row, col);
    let count = 0;
    for (let i = 0; i < nearbyCells.length; i++) {
        const [nearbyRow, nearbyCol] = nearbyCells[i];
        if (cells[nearbyRow][nearbyCol].status === "mine") {
            count++;
        }
    }
    return count;
}

function handleClick(event) {
    const row = parseInt(event.target.getAttribute("data-row"));
    const col = parseInt(event.target.getAttribute("data-col"));
    const cell = cells[row][col];
    if (cell.status === "flag" && cell.getAttribute("data-mine") === "true") {
        cell.classList.add("mine-red");
    } else {
        revealCell(row, col);
    }
}

function handleRightClick(event) {
    event.preventDefault();
    const row = parseInt(event.target.getAttribute("data-row"));
    const col = parseInt(event.target.getAttribute("data-col"));
    const cell = cells[row][col];
    if (cell.status === "hidden") {
        cell.status = "flag";
        cell.classList.add("flag");
        updateMinesCounter();
    } else if (cell.status === "flag") {
        cell.status = "question";
        cell.classList.remove("flag");
        cell.classList.add("question");
        updateMinesCounter();
    } else if (cell.status === "question") {
        cell.status = "hidden";
        cell.classList.remove("question");
    } else if (cell.status === "mine") {
        cell.status = "flag";
        cell.classList.add("flag");
        updateMinesCounter();
    }
}

function createDigitElements(counterElem, counterValue) {
    const digits = counterValue.toString().padStart(3, '0').split("");

    counterElem.innerHTML = "";

    digits.forEach(digit => {
        const digitElement = document.createElement("div");
        digitElement.className = "num";
        digitElement.classList.add(`num-${digit}`)

        counterElem.appendChild(digitElement);
    });
}

function updateMinesCounter() {
    minesCounter = MINES;
    minesCounter -= document.querySelectorAll(".flag").length;

    if (minesCounter < 0) {
        minesCounter = 0;
    }

    const minesCounterElem = document.querySelector('.mines');
    createDigitElements(minesCounterElem, minesCounter);
}

function startTimer() {
    timerIntervalId = setInterval(() => {
        elapsedTime++;
        updateTimer();
        if (elapsedTime > 999) {
            stopTimer();
            gameEnd(false);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateTimer();
}

function updateTimer() {
    const seconds = elapsedTime;
    const secondsStr = seconds.toString().padStart(3, "0");

    const timeElem = document.querySelector(".time")
    createDigitElements(timeElem, secondsStr);
}
