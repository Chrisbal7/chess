'use strict';

const chessBoard = document.querySelector('.chess-board');

// Chess pieces
const whiteChess = [
  '\u{2654}',
  '\u{2655}',
  '\u{2656}',
  '\u{2657}',
  '\u{2658}',
  '\u{2659}',
];
const blackChess = [
  '\u{265A}',
  '\u{265B}',
  '\u{265C}',
  '\u{265D}',
  '\u{265E}',
  '\u{265F}',
];
const empty = '\u{00A0}';
const [K, Q, R, B, N, P] = whiteChess;
const [k, q, r, b, n, p] = blackChess;

const chessColLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const whiteChessValues = ['K', 'Q', 'R', 'B', 'N', 'P'];
const blackChessValues = ['k', 'q', 'r', 'b', 'n', 'p'];
// Get a notation based on cell and row Index
const getLabel = function (rowIndex, colIndex) {
  const chessRowLabel = chessBoard.rows.length - rowIndex;
  const chessColLabel = chessColLabels[colIndex];
  return `${chessColLabel}${chessRowLabel}`;
};

for (let i = 0; i < 8; i++) {
  const chessRow = document.createElement('tr');
  chessBoard.appendChild(chessRow);
  chessRow.classList.add('chess-row');
  for (let i = 0; i < 8; i++) {
    const chessSquare = document.createElement('td');
    chessRow.appendChild(chessSquare);
    chessSquare.textContent = '';
    chessSquare.classList.add('square');
    chessSquare.textContent = '\u{00A0}';
  }
  const halfNumber = (i + 1) / 2;
  const r = halfNumber - Math.trunc(halfNumber);
  r !== 0
    ? chessRow.classList.add('chess-row-odd')
    : chessRow.classList.add('chess-row-even');
}

const chessSquareNode = document.querySelectorAll('.square');
const init = function () {
  // Black pieces
  for (let i = 0; i < 64; i++) {
    switch (i) {
      case 0:
      case 7:
        chessSquareNode[i].textContent = r;
        chessSquareNode[i].value = 'r';
        break;
      case 1:
      case 6:
        chessSquareNode[i].textContent = n;
        chessSquareNode[i].value = 'n';
        break;
      case 2:
      case 5:
        chessSquareNode[i].textContent = b;
        chessSquareNode[i].value = 'b';
        break;
      case 3:
        chessSquareNode[i].textContent = k;
        chessSquareNode[i].value = 'k';
        break;
      case 4:
        chessSquareNode[i].textContent = q;
        chessSquareNode[i].value = 'q';
        break;
      case 56:
      case 63:
        chessSquareNode[i].textContent = R;
        chessSquareNode[i].value = 'R';
        break;
      case 57:
      case 62:
        chessSquareNode[i].textContent = N;
        chessSquareNode[i].value = 'N';
        break;
      case 58:
      case 61:
        chessSquareNode[i].textContent = B;
        chessSquareNode[i].value = 'B';
        break;
      case 59:
        chessSquareNode[i].textContent = K;
        chessSquareNode[i].value = 'K';
        break;
      case 60:
        chessSquareNode[i].textContent = Q;
        chessSquareNode[i].value = 'Q';
        break;
      default:
        chessSquareNode[i].textContent = '\u{00A0}';
        chessSquareNode[i].value = '';
    }
  }
  //Black spaces
  for (let i = 8; i < 16; i++) {
    chessSquareNode[i].textContent = p;
    chessSquareNode[i].value = 'p';
  }
  //White pieces
  for (let i = 48; i < 56; i++) {
    chessSquareNode[i].textContent = P;
    chessSquareNode[i].value = 'P';
  }
};
init();

const inCheck = function () {};
const inCheckMate = function () {};
const capturePieces = function () {};

const activatePiece = function () {};

// const switchPlayer = function () {};
// const movePieces = function () {
//   capturePieces();
//   inCheck();
//   inCheckMate();
// };

up = down = left = right = diagUp1 = diagDown1 = diagUp2 = diagDown2 = [];

chessSquareNode.forEach((cell) => {
  cell.addEventListener('click', () => {
    if (cell.textContent !== '\u{00A0}') {
      const chessRowIndex = cell.closest('tr').rowIndex;
      const chessColIndex = cell.cellIndex;
      const notation = getLabel(chessRowIndex, chessColIndex);
      const chessSq = chessBoard.rows[chessRowIndex].cells[chessColIndex];
    }
  });
});
const legalMoves = function (rowIndex, colIndex) {
  //For the queen //Center (rowIndex,colIndex)
  // Horizontal x= rowIndex
  //Constructing data ; Count is the stuff is empty, 2. There is a piece there if(white or black)
  // From the center count
  for (let i = rowIndex; i < chessBoard.length - rowIndex; i++) {
    console.log(i);
    // const legalChessMoves = chessBoard.rows[rowIndex].cells[i];
    // console.log(legalChessMoves);
    // if (i === colIndex) continue;
    // if (chessBoard.rows[rowIndex].cells[i + 1].value == empty) break
    // legalChessMoves.classList.add("dot");
  }
};
// Function to set moves
const move = function (rowIndex1, cellIndex1, rowIndex2, cellIndex2) {
  const chessSquare1 = chessBoard.rows[rowIndex1].cells[cellIndex1];
  const chessSquare2 = chessBoard.rows[rowIndex2].cells[cellIndex2];
  const chessContent = chessSquare1.textContent;
  chessSquare2.textContent = chessContent;
  chessSquare2.value = chessSquare1.value;
  chessSquare1.textContent = empty;
  chessSquare1.value = '';

  // Switch the players
};
move(0, 3, 3, 3);
console.log(chessBoard.rows[3].cells[3].value);

//The king
// Problem : move the king up, down,sideways and diagonal
const pieces = {
  chessPieces: [
    ['K', 'k'],
    ['Q', 'q'],
  ],
};
// Recognize if it is the king
// Set possibles moves for the king
// Make it active for the first click,
// Don't recognize the same click
// Move the king to the second position right on click
// Ignore the non-legal moves

//Functionalities
// Check
// Checkmate
// Draw
//
