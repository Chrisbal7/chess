'use strict';

const chessBoardEl = document.querySelector('.chess-board');
const nbsp = '\u{00A0}';
const promotePawnEl = document.querySelector('.pawn-promotion');

const chess = {
  king: [
    ['K', 'k'],
    ['\u{2654}', '\u{265A}'],
  ],
  queen: [
    ['Q', 'q'],
    ['\u{2655}', '\u{265B}'],
  ],
  rook: [
    ['R', 'r'],
    ['\u{2656}', '\u{265C}'],
  ],
  bishop: [
    ['B', 'b'],
    ['\u{2657}', '\u{265D}'],
  ],
  knight: [
    ['N', 'n'],
    ['\u{2658}', '\u{265E}'],
  ],
  pawn: [
    ['P', 'p'],
    ['\u{2659}', '\u{265F}'],
  ],

  xLabel: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  allowedMoves: [],
  activate: [],
  capturables: [],
  activePlayer: 0, // Start with the white moves
  errors: [],
  dotables: [],
  enPassantCapt: [],
  castling: {
    queenSide: [],
    kingSide: [],
  },
  counters: {},

  initialize: function () {
    this.king.moveCount = [0, 0];
    this.rook.moveCount = [
      [0, 0],
      [0, 0],
    ]; // 1. Rooks with 0 like cellIndex 2. Rooks with 7 as cellIndex
    this.counters.clickCount = 1;
    this.counters.gameCount = 1;
    for (let i = 0; i < 8; i++) {
      const chessRow = document.createElement('tr');
      chessBoardEl.appendChild(chessRow);
      for (let i = 0; i < 8; i++) {
        const chessCell = document.createElement('td');
        chessRow.appendChild(chessCell);
        chessCell.textContent = nbsp;
        chessCell.value = undefined;
      }
      // Coloring the board
      const a = (i + 1) / 2 - Math.trunc((i + 1) / 2);
      if (a === 0) {
        chessRow.classList.add('chess-row-odd');
      } else {
        chessRow.classList.add('chess-row-even');
      }
      const chessYLabel = chessBoardEl.rows[i].cells[0];
      chessYLabel.classList.add('label');
      const r = 8 - i;
      chessYLabel.setAttribute('data-content', r);
    }

    for (let i = 0; i < 8; i++) {
      const chessXLabel = chessBoardEl.rows[7].cells[i];
      chessXLabel.classList.add('x-label');
      chessXLabel.setAttribute('data-content-x', this.xLabel[i]);
    }

    this.chessBoardSetUp();
    this.getLegalMoves();
  },
  chessBoardSetUp: function () {
    chessBoardEl.rows[1].querySelectorAll('td').forEach((p) => {
      p.textContent = chess.pawn[1][1];
      p.value = chess.pawn[0][1];
    });
    chessBoardEl.rows[6].querySelectorAll('td').forEach((p) => {
      p.textContent = chess.pawn[1][0];
      p.value = chess.pawn[0][0];
    });
    const blackPieces = chessBoardEl.rows[0].querySelectorAll('td');
    const whitePieces = chessBoardEl.rows[7].querySelectorAll('td');

    for (let i = 0; i <= 4; i++) {
      let piece;
      switch (i) {
        case 0:
          piece = chess.rook;
          break;
        case 1:
          piece = chess.knight;
          break;
        case 2:
          piece = chess.bishop;
          break;
        case 3:
          piece = chess.queen;
          break;
        case 4:
          piece = chess.king;
          break;
      }
      if (i < 3) {
        blackPieces[i].textContent = blackPieces[7 - i].textContent =
          piece[1][1];
        blackPieces[i].value = blackPieces[7 - i].value = piece[0][1];
        whitePieces[i].textContent = whitePieces[7 - i].textContent =
          piece[1][0];
        whitePieces[i].value = whitePieces[7 - i].value = piece[0][0];
      } else {
        whitePieces[i].value = piece[0][0];
        whitePieces[i].textContent = piece[1][0];
        blackPieces[i].textContent = piece[1][1];
        blackPieces[i].value = piece[0][1];
      }
    }
  },

  getIndex: function (el) {
    const chessRowIndex = el.closest('tr').rowIndex;
    const chessCellIndex = el.cellIndex;
    return [chessRowIndex, chessCellIndex];
  },

  getLegalMoves: function () {
    document.querySelectorAll('td').forEach((piece) => {
      piece.addEventListener('click', (event) => {
        const self = this;
        const [rowIndex, cellIndex] = this.getIndex(piece);

        const switchPlayer = function () {
          return self.activePlayer === 0 ? 1 : 0;
        };

        const knightHandler = function (rowIndex, cellIndex) {
          const knightMoves = [
            [rowIndex + 2, cellIndex - 1],
            [rowIndex + 2, cellIndex + 1],
            [rowIndex - 2, cellIndex - 1],
            [rowIndex - 2, cellIndex + 1],
            [rowIndex + 1, cellIndex + 2],
            [rowIndex - 1, cellIndex + 2],
            [rowIndex + 1, cellIndex - 2],
            [rowIndex - 1, cellIndex - 2],
          ];
          const invalidMoves = function ([a, b]) {
            if (
              a > 7 ||
              a < 0 ||
              b > 7 ||
              b < 0 ||
              (self.isTeamMate(self.getEl(rowIndex, cellIndex), a, b) &&
                self.getEl(a, b).value)
            ) {
              return false;
            } else {
              if (
                self.getEl(a, b).value &&
                !self.isTeamMate(self.getEl(rowIndex, cellIndex), a, b)
              ) {
                self.capturables.push([a, b]);
              }
              return true;
            }
          };
          self.allowedMoves = knightMoves.filter(invalidMoves);
          return self.capturables;
        };

        const initMarks = function () {
          if (self.errors.length)
            self.errors.forEach((error) => {
              error.classList.remove('error');
            });
          if (self.capturables.length)
            self.capturables.forEach(([a, b]) => {
              self.getEl(a, b).classList.remove('capturable');
            });
          if (self.dotables.length) {
            self.dotables.forEach(([a, b]) => {
              self.getEl(a, b).classList.remove('dot');
            });
          }
          self.errors.length = 0;
          self.dotables.length = 0;
        };

        if (this.checkArray(this.capturables, this.getIndex(piece))) {
          console.log(this.capturables);
          const capturer = document.querySelector('.active');
          piece.value = capturer.value;
          piece.textContent = capturer.textContent;
          capturer.value = undefined;
          capturer.textContent = nbsp;
          capturer.classList.remove('active');
          //Switch player
          self.activePlayer = switchPlayer();
          initMarks();
          self.capturables = [];
          self.dotables = [];
        } else {
          //Run the target and play code

          const changeActive = function () {
            if (self.activate.length !== 0) {
              self
                .getEl(self.activate[0], self.activate[1])
                .classList.remove('active');
              self.activate = [];
            }
          };
          initMarks();

          if (typeof piece.value === 'string') {
            initMarks();
            self.allowedMoves = [];
            self.dotables = [];
            piece.classList.toggle('active');
            changeActive();

            if (piece.classList.contains('active')) {
              this.activate = [rowIndex, cellIndex];

              // Select pieces
              switch (piece.value) {
                case this.king[0][this.activePlayer]:
                  let kingMoves = [...this.legalMove(rowIndex, cellIndex, 1)];

                  const cleanMoves = function (value) {
                    const [a, b] = value;
                    if (a < 0 || b < 0 || a > 7 || b > 7) {
                      return false;
                    } else {
                      return self.getEl(a, b).value &&
                        self.isTeamMate(piece, a, b)
                        ? false
                        : true;
                    }
                  };

                  kingMoves = kingMoves.filter(cleanMoves);

                  //Castling
                  if (!this.king.moveCount[this.activePlayer]) {
                    //Check if the counter of the rook it is zero
                    const rookRowIndex = self.activePlayer ? 0 : 7;
                    const leftRook = self.rook.moveCount[0][self.activePlayer];
                    const rightRook = self.rook.moveCount[1][self.activePlayer];
                    let queenSide = [];
                    let kingSide = [];
                    for (let i = 1; i < 4; i++) {
                      queenSide.push(self.getEl(7, i).value);
                      if (i < 3) {
                        kingSide.push(self.getEl(7, i + 4).value);
                      }
                    }

                    if (!leftRook && queenSide.every((x) => !x)) {
                      kingMoves.push([rowIndex, cellIndex - 2]);
                      self.castling.queenSide.push(
                        [rowIndex, cellIndex - 2],
                        [rowIndex, cellIndex - 1],
                        [rookRowIndex, 0]
                      );
                      //rook : rowIndex, cellIndex + 3
                    }
                    if (!rightRook && kingSide.every((x) => !x)) {
                      kingMoves.push([rowIndex, cellIndex + 2]);
                      self.castling.kingSide.push(
                        [rowIndex, cellIndex + 2],
                        [rowIndex, cellIndex + 1],
                        [rookRowIndex, 7]
                      );
                      //rook : rowIndex, cellIndex - 2
                    }
                  }

                  //Run the parseValue fonction
                  this.deletable.length = 0;
                  this.parseValue(kingMoves, rowIndex, cellIndex);

                  const deleteArr = function (value) {
                    if (self.checkArray(self.deletable, value)) {
                      return false;
                    } else {
                      return true;
                    }
                  };
                  //Set this.allowed this dotables and this.allowed
                  this.allowedMoves = kingMoves.filter(deleteArr);
                  for (const [a, b] of this.allowedMoves) {
                    if (
                      !self.isTeamMate(self.getEl(rowIndex, cellIndex), a, b) &&
                      self.getEl(a, b).value
                    )
                      self.capturables.push([a, b]);
                  }
                  break;

                case this.queen[0][this.activePlayer]:
                case this.rook[0][this.activePlayer]:
                case this.bishop[0][this.activePlayer]:
                  this.moveHandler(rowIndex, cellIndex);
                  break;

                case this.knight[0][this.activePlayer]:
                  knightHandler(rowIndex, cellIndex);
                  break;

                case this.pawn[0][this.activePlayer]:
                  let m, n;
                  switch (this.activePlayer) {
                    case 0:
                      (m = -1), (n = -2);
                      break;
                    case 1:
                      (m = 1), (n = 2);
                      break;
                  }
                  const nextCase = chess.getEl(rowIndex + m, cellIndex);
                  let farCase;
                  if (rowIndex + n >= 0 && rowIndex + n < 8) {
                    farCase = chess.getEl(rowIndex + n, cellIndex);
                  }

                  if (!nextCase.value) {
                    this.allowedMoves = [this.getIndex(nextCase)];
                  }
                  if (
                    (this.activePlayer && rowIndex + n < 8) ||
                    (!this.activePlayer && rowIndex + n > 0)
                  ) {
                    if (
                      (!farCase.value &&
                        !nextCase.value &&
                        rowIndex === 1 &&
                        !this.getTeam(piece)) ||
                      (!farCase.value &&
                        !nextCase.value &&
                        rowIndex === 6 &&
                        this.getTeam(piece))
                    ) {
                      this.allowedMoves.push(this.getIndex(farCase));
                    }
                  }
                  // How to capture that elements en passant
                  //Check for enPassant rule
                  if (self.enPassantArr.length) {
                    for (const coupleEl of self.enPassantArr) {
                      const [td, weakTd] = coupleEl;
                      if (td.classList.contains('active')) {
                        //Allow the pawn to move there
                        const [x, y] = self.getIndex(weakTd);
                        console.log(x, y);

                        if (self.activePlayer) {
                          self.allowedMoves.push([x + 1, y]);
                          self.enPassantCapt.push([x, y], [x + 1, y]);
                        } else {
                          self.allowedMoves.push([x - 1, y]);
                          self.enPassantCapt.push([x, y], [x - 1, y]);
                        }
                        //Special capturing
                        console.log(self.allowedMoves);
                      }
                    }
                  }

                  // Capture elements
                  const tempCapturables = [
                    [rowIndex + m, cellIndex + m],
                    [rowIndex + m, cellIndex - m],
                  ];
                  for (let [a, b] of tempCapturables) {
                    if (
                      a < 0 ||
                      b < 0 ||
                      a > 7 ||
                      b > 7 ||
                      (this.isTeamMate(piece, a, b) && this.getEl(a, b).value)
                    ) {
                      continue;
                    }
                    if (
                      this.getEl(a, b).value &&
                      !this.isTeamMate(piece, a, b)
                    ) {
                      this.getEl(a, b).classList.add('capturable');
                      this.capturables.push([a, b]);
                    }
                  }
                  for (let i = 0; i < this.capturables.length; i++) {
                    this.allowedMoves.push(this.capturables[i]);
                  }

                  break;
              }

              this.capturables.forEach(([a, b]) => {
                self.getEl(a, b).classList.add('capturable');
              });
            }
            for (let [a, b] of this.dotables) {
              self.getEl(a, b).classList.add('dot');
            }
            return this.legalMoves;
          } else {
            if (this.activate) {
              const choosedCase = this.getIndex(piece);
              const [caseRowIndex, caseCellIndex] = choosedCase;
              const [activeRowIndex, activeCellIndex] = this.activate;
              const activeEl = this.getEl(activeRowIndex, activeCellIndex);

              if (
                activeEl.classList.contains('active') &&
                this.checkArray(this.allowedMoves, choosedCase)
              ) {
                self.movePieces(
                  activeRowIndex,
                  activeCellIndex,
                  caseRowIndex,
                  caseCellIndex
                );
                chessBoardEl.rows[activeRowIndex].cells[
                  activeCellIndex
                ].classList.remove('active');
                initMarks();
                self.allowedMoves.length = 0;
                self.capturables.length = 0;
                self.dotables = [];
                self.activePlayer = switchPlayer();
              } else {
                piece.classList.add('error');
                self.errors.push(piece);
              }
            }
          }
        }
      });
    });
  },

  checkArray: function (data, arr) {
    if (data) {
      return data.some(
        (e) => Array.isArray && e.every((o, i) => Object.is(arr[i], o))
      );
    }
  },

  legalMove: function (rowIndex, cellIndex, a) {
    return [
      [rowIndex + a, cellIndex],
      [rowIndex - a, cellIndex],
      [rowIndex, cellIndex - a],
      [rowIndex, cellIndex + a],
      [rowIndex + a, cellIndex + a],
      [rowIndex - a, cellIndex - a],
      [rowIndex + a, cellIndex - a],
      [rowIndex - a, cellIndex + a],
    ];
  },
  movePieces: function (a, b, c, d) {
    const self = this;
    const activeCase = chessBoardEl.rows[a].cells[b];
    const movedCase = chessBoardEl.rows[c].cells[d];
    movedCase.textContent = activeCase.textContent;
    movedCase.value = activeCase.value;
    activeCase.value = undefined;
    activeCase.textContent = nbsp;
    activeCase.classList.remove('active');

    const checkEnPassant = function (a, b) {
      let sideEl = [];
      const invalidCell = function ([i, j]) {
        if (j > 7 || j < 0) {
          return false;
        } else {
          sideEl.push(self.getEl(i, j));
          return true;
        }
      };
      const sideValue = [
        [a, b + 1],
        [a, b - 1],
      ];
      sideValue.filter(invalidCell);
      for (let td of sideEl) {
        if (td.value === self.pawn[0][Number(!self.activePlayer)]) {
          self.enPassantArr.push([td, self.getEl(a, b)]);
        }
      }
    };

    if (movedCase.value === this.king[0][this.activePlayer]) {
      if (!self.king.moveCount[self.activePlayer]) {
        const castleEntries = Object.entries(self.castling);

        for (let [str, arr] of castleEntries) {
          //Check the [c,d] in the array
          if (self.checkArray(arr, [c, d])) {
            self.getEl(...self.castling[str][1]).value =
              self.rook[0][self.activePlayer];
            self.getEl(...self.castling[str][1]).textContent =
              self.rook[1][self.activePlayer];
            self.getEl(...self.castling[str][2]).value = undefined;
            self.getEl(...self.castling[str][2]).textContent = nbsp;
          }
        }
      }

      self.king.moveCount[self.activePlayer]++;
      //Reinitialize the castling object
      self.castling = { queenSide: [], kingSide: [] };
    }

    //Count the rook moves
    if (movedCase.value === this.rook[0][this.activePlayer]) {
      if (b === 0) {
        self.rook.moveCount[0][self.activePlayer]++;
      } else if (b === 7) {
        self.rook.moveCount[1][self.activePlayer]++;
      }
    }

    this.enPassantArr.length = 0;
    if (movedCase.value === this.pawn[0][this.activePlayer]) {
      const [capt, move] = self.enPassantCapt;
      if (move)
        if (movedCase === self.getEl(...move)) {
          console.log(`Capturing element en passant`);
          self.getEl(...capt).value = undefined;
          self.getEl(...capt).textContent = nbsp;
        }
      if (self.activePlayer) {
        if (c === a + 2) {
          checkEnPassant(c, d);
        }
        if (c === 7) {
          this.promotePawn(c, d);
        }
      } else if (!self.activePlayer) {
        if (c === a - 2) {
          checkEnPassant(c, d);
        }
        if (c === 0) {
          this.promotePawn(c, d);
        }
      }
    }
    this.enPassantCapt = [];

    this.allowedMoves.length = 0;
    this.capturables.length = 0;
    this.inCheck(movedCase);
    console.log(this.getLabel(movedCase));
  },

  getLabel: function (el) {
    this.counters.clickCount++;
    if (this.counters.clickCount % 2 === 0) this.counters.gameCount++;
    const [rowIndex, colIndex] = this.getIndex(el);
    const chessRowLabel = chessBoardEl.rows.length - rowIndex;
    const chessColLabel = chess.xLabel[colIndex];
    if (el.value === this.pawn[0][this.activePlayer]) {
      return `${this.counters.gameCount - 1}.${chessColLabel}${chessRowLabel}`;
    } else {
      return `${this.counters.gameCount - 1}.${
        el.textContent
      }${chessColLabel}${chessRowLabel}`;
    }
  },

  moveHandler: function (rowIndex, cellIndex) {
    // General structure
    const self = this;

    let all = [];
    self.capturables = [];
    self.allowedMoves = [];

    for (let i = 0; i < 8; i++) {
      all.push(...self.legalMove(rowIndex, cellIndex, i + 1));
    }

    const invalidIndex = function (value) {
      const [a, b] = value;
      return a < 0 || b < 0 || a > 7 || b > 7 ? false : true;
    };
    const allFiltered = all.filter(invalidIndex);

    let right = [];
    let left = [];
    let up = [];
    let down = [];
    let diagUp1 = [];
    let diagUp2 = [];
    let diagDown1 = [];
    let diagDown2 = [];

    for (let sorted of allFiltered) {
      const [a, b] = sorted;
      const m = (cellIndex - b) / (rowIndex - a);
      if (!Number.isFinite(m)) {
        b > cellIndex ? right.push(sorted) : left.push(sorted);
      } else if (m === 0) {
        a > rowIndex ? down.push(sorted) : up.push(sorted);
      } else if (m === 1) {
        a < rowIndex ? diagUp1.push(sorted) : diagDown1.push(sorted);
      } else if (m === -1) {
        a < rowIndex ? diagUp2.push(sorted) : diagDown2.push(sorted);
      }
      // Create dottables and capturables
    }
    const xyAxis = [[...up], [...down], [...right], [...left]];

    const diagonal = [
      [...diagUp2],
      [...diagUp1],
      [...diagDown1],
      [...diagDown2],
    ];
    const combined = xyAxis.concat(diagonal);
    console.log(diagonal);
    const sortLegalMoves = function (axis) {
      for (let arr of axis) {
        for (let [a, b] of arr) {
          const pieceEl = self.getEl(rowIndex, cellIndex);
          if (!self.isTeamMate(pieceEl, a, b) && self.getEl(a, b).value) {
            console.log('opponent');
            self.capturables.push([a, b]);
            break;
          } else if (self.isTeamMate(pieceEl, a, b) && self.getEl(a, b).value) {
            console.log(a, b);
            break;
          } else {
            self.dotables.push([a, b]);
            console.log('I can move there');
            console.log(self.dotables.length);
          }
        }
      }
      return (self.allowedMoves = self.capturables.concat(self.dotables));
    };
    let setAxis = [];
    switch (self.getEl(rowIndex, cellIndex).value) {
      case 'Q':
      case 'q':
        setAxis = combined;
        break;
      case 'R':
      case 'r':
        setAxis = xyAxis;
        break;
      case 'B':
      case 'b':
        setAxis = diagonal;
        break;
    }

    return sortLegalMoves(setAxis);
  },

  // Special rules
  /***** Pawn promotion ********/

  promotePawn: function (a, b) {
    const self = this;
    const btnParent = document.querySelector('.pawn-promotion');
    btnParent.classList.remove('hidden');
    if (this.activePlayer) {
      btnParent.classList.add('pawn-promotion--var');
    }
    const promotedPieceEl = this.getEl(a, b);

    const { queen, rook, bishop, knight } = this;
    const promoter = [queen, rook, bishop, knight];

    if (!btnParent.hasChildNodes()) {
      for (let i = 0; i < 4; i++) {
        const btnEl = document.createElement('button');
        btnParent.appendChild(btnEl);
      }
    }

    // Distribute value
    for (const [i, btn] of document.querySelectorAll('button').entries()) {
      btn.value = promoter[i][0][this.activePlayer];
      btn.textContent = promoter[i][1][this.activePlayer];

      btn.addEventListener('click', () => {
        promotedPieceEl.value = btn.value;
        promotedPieceEl.textContent = btn.textContent;
        // Close everything
        if (btnParent.classList.contains('pawn-promotion--var'))
          btnParent.classList.remove('pawn-promotion--var');
        btnParent.classList.add('hidden');
      });
    }
  },

  /***** En passant rule *********/
  enPassantArr: [],

  test: function () {
    chessBoardEl.rows[4].cells[5].value = this.king[0][0];
    chessBoardEl.rows[4].cells[5].textContent = this.king[1][0];
  },
  getTeam: function (el) {
    return /^[A-Z]*$/.test(el.value);
  },
  isTeamMate: function (team, a, b) {
    //Team : Boolean
    //c and d : number
    return this.getTeam(team) === this.getTeam(this.getEl(a, b)) ? true : false;
  },
  getEl: function (a = null, b = null) {
    const htmlEl = chessBoardEl.rows[a].cells[b];
    return htmlEl;
  },
  parseValue: function (arr, rowIndex, cellIndex) {
    //e stand for element, basically an array [a,b]
    const self = this;

    for (const e of arr) {
      let up = [];
      let down = [];
      let dUp1 = [];
      let dUp2 = [];
      let dDown1 = [];
      let dDown2 = [];
      let right = [];
      let left = [];
      const [x, y] = e;
      let validMoves = [];

      let knightCheck = [
        [x + 2, y - 1],
        [x + 2, y + 1],
        [x - 2, y - 1],
        [x - 2, y + 1],
        [x + 1, y + 2],
        [x - 1, y + 2],
        [x + 1, y - 2],
        [x - 1, y - 2],
      ];

      for (let i = 0; i < 8; i++) {
        validMoves.push(...this.legalMove(x, y, i + 1));
      }

      const invalidValue = function (value) {
        const [a, b] = value;
        if (a < 0 || b < 0 || a > 7 || b > 7) {
          return false;
        } else {
          return true;
        }
      };
      validMoves = validMoves.filter(invalidValue);
      knightCheck = knightCheck.filter(invalidValue);

      for (const [a, b] of knightCheck) {
        if (
          self.getEl(a, b).value === self.knight[0][Number(!self.activePlayer)]
        )
          self.deletable.push([x, y]);
      }

      for (let valueSorted of validMoves) {
        const [i, j] = valueSorted;
        let m = (y - j) / (x - i);
        switch (m) {
          case 0:
            i > x ? up.push(valueSorted) : down.push(valueSorted);
            break;
          case Infinity:
          case -Infinity:
            j > y ? right.push(valueSorted) : left.push(valueSorted);
            break;
          case 1:
            i > x ? dUp1.push(valueSorted) : dDown1.push(valueSorted);
            break;
          case -1:
            i > x ? dUp2.push(valueSorted) : dDown2.push(valueSorted);
            break;
        }
      }

      let xyAxis = [
        [...up],
        [...down],
        [...right],
        [...left],
        [...dUp1],
        [...dDown1],
        [...dUp2],
        [...dDown2],
      ];
      const that = this;

      this.breakPoints(xyAxis, x, y, rowIndex, cellIndex);
    }

    return this.deletable;
  },

  deletable: [],
  getSlope: function (a, b, c, d) {
    return (d - b) / (c - a);
  },
  breakPoints: function (axis, x, y, rowIndex, cellIndex) {
    const that = this;
    loop1: for (let dir of axis) {
      for (const [a, b] of dir) {
        const isOpponent = !that.isTeamMate(
          that.getEl(rowIndex, cellIndex),
          a,
          b
        );

        if (that.getEl(a, b).value && !isOpponent) {
          continue loop1;
        } else if (that.getEl(a, b).value && isOpponent) {
          const m = this.getSlope(x, y, a, b);
          switch (that.getEl(a, b).value) {
            case that.king[0][Number(!that.activePlayer)]:
              if (
                (x + 1 === a && y === b) ||
                (x - 1 === a && y === b) ||
                (x === a && y - 1 === b) ||
                (x === a && y + 1 === b) ||
                (x + 1 === a && y + 1 === b) ||
                (x - 1 === a && y - 1 === b) ||
                (x + 1 === a && y - 1 === b) ||
                (x - 1 === a && y + 1 === b)
              ) {
                this.deletable.push([x, y]);
              }
              break;
            case that.queen[0][Number(!that.activePlayer)]:
              this.deletable.push([x, y]);
              break;
            case that.rook[0][Number(!that.activePlayer)]:
              if (m === 0 || !Number.isFinite(m)) {
                this.deletable.push([x, y]);
              }
              break;
            case that.bishop[0][Number(!that.activePlayer)]:
              if (m === 1 || m === -1) {
                this.deletable.push([x, y]);
              }
              break;
            case that.pawn[0][Number(!that.activePlayer)]:
              if (
                (that.activePlayer === 0 && x - 1 === a && y - 1 === b) ||
                (that.activePlayer === 1 && x + 1 === a && y + 1 === b)
              ) {
                this.deletable.push([x, y]);
              }
              break;
          }
          continue loop1;
        }
      }
    }
    return this.deletable;
  },
  inCheck: function (el) {
    const [a, b] = this.getIndex(el);
    //Find the opposite king
    king;
    //Then find capturables of that element, is the king contained : check a way for the king to get out, add a check +, if he can't then declare a checkmate
  },
};

chess.initialize();
chess.test();

//Work on the notation
//How to know if the king is in check
// How to know if the king is in checkmate
