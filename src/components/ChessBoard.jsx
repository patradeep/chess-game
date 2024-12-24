import { useState } from 'react';

function ChessBoard({ board, playerColor, onMove, currentTurn }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getSquareColor = (fileIndex, rankIndex) => {
    return (fileIndex + rankIndex) % 2 === 0 ? 'light' : 'dark';
  };

  const getSquareNotation = (fileIndex, rankIndex) => {
    return `${files[fileIndex]}${ranks[rankIndex]}`;
  };

  const calculatePossibleMoves = (piece, row, col) => {
    if (!piece) return [];
    
    const moves = [];
    const isWhite = piece.color === 'w';
    
    switch (piece.type) {
      case 'p': // Pawn
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Forward move
        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
          moves.push(getSquareNotation(col, row + direction));
          // Double move from starting position
          if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push(getSquareNotation(col, row + 2 * direction));
          }
        }
        
        // Capture moves
        [-1, 1].forEach(offset => {
          if (col + offset >= 0 && col + offset < 8 && row + direction >= 0 && row + direction < 8) {
            const targetPiece = board[row + direction][col + offset];
            if (targetPiece && targetPiece.color !== piece.color) {
              moves.push(getSquareNotation(col + offset, row + direction));
            }
          }
        });
        break;

      case 'r': // Rook
        [[-1,0], [1,0], [0,-1], [0,1]].forEach(([dr, dc]) => {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
              moves.push(getSquareNotation(c, r));
            } else {
              if (board[r][c].color !== piece.color) {
                moves.push(getSquareNotation(c, r));
              }
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'n': // Knight
        [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]].forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c] || board[r][c].color !== piece.color) {
              moves.push(getSquareNotation(c, r));
            }
          }
        });
        break;

      case 'b': // Bishop
        [[-1,-1], [-1,1], [1,-1], [1,1]].forEach(([dr, dc]) => {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
              moves.push(getSquareNotation(c, r));
            } else {
              if (board[r][c].color !== piece.color) {
                moves.push(getSquareNotation(c, r));
              }
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'q': // Queen (combination of Rook and Bishop moves)
        [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].forEach(([dr, dc]) => {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
              moves.push(getSquareNotation(c, r));
            } else {
              if (board[r][c].color !== piece.color) {
                moves.push(getSquareNotation(c, r));
              }
              break;
            }
            r += dr;
            c += dc;
          }
        });
        break;

      case 'k': // King
        [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c] || board[r][c].color !== piece.color) {
              moves.push(getSquareNotation(c, r));
            }
          }
        });
        break;
    }
    
    return moves;
  };

  const handleSquareClick = (fileIndex, rankIndex) => {
    if (currentTurn !== playerColor) return;

    const notation = getSquareNotation(fileIndex, rankIndex);
    
    if (selectedSquare === notation) {
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else if (selectedSquare && possibleMoves.includes(notation)) {
      // Make the move without checking for check
      onMove(selectedSquare, notation);
      setSelectedSquare(null);
      setPossibleMoves([]);
    } else {
      const piece = board[rankIndex][fileIndex];
      if (piece && 
          ((piece.color === 'w' && playerColor === 'white') ||
           (piece.color === 'b' && playerColor === 'black'))) {
        setSelectedSquare(notation);
        // Calculate all possible moves without filtering for check
        setPossibleMoves(calculatePossibleMoves(piece, rankIndex, fileIndex));
      }
    }
  };

  const getPieceSymbol = (piece) => {
    if (!piece) return null;
    
    const symbols = {
      'w': {
        'p': '♙',
        'n': '♘',
        'b': '♗',
        'r': '♖',
        'q': '♕',
        'k': '♔'
      },
      'b': {
        'p': '♟',
        'n': '♞',
        'b': '♝',
        'r': '♜',
        'q': '♛',
        'k': '♚'
      }
    };

    return symbols[piece.color][piece.type];
  };

  const boardToRender = playerColor === 'black' ? 
    [...board].reverse().map(row => [...row].reverse()) : 
    board;

  return (
    <div className="chess-board-container">
      <div className="chess-board">
        {boardToRender.map((row, rankIndex) => (
          row.map((piece, fileIndex) => {
            const squareColor = getSquareColor(fileIndex, rankIndex);
            const notation = getSquareNotation(
              playerColor === 'black' ? 7 - fileIndex : fileIndex,
              playerColor === 'black' ? 7 - rankIndex : rankIndex
            );
            const isSelected = selectedSquare === notation;
            const isPossibleMove = possibleMoves.includes(notation);

            return (
              <div
                key={notation}
                className={`chess-square ${squareColor} ${isSelected ? 'selected' : ''} ${isPossibleMove ? 'possible-move' : ''}`}
                onClick={() => handleSquareClick(
                  playerColor === 'black' ? 7 - fileIndex : fileIndex,
                  playerColor === 'black' ? 7 - rankIndex : rankIndex
                )}
              >
                {piece && (
                  <div className={`chess-piece ${piece.color === 'w' ? 'white' : 'black'}`}>
                    {getPieceSymbol(piece)}
                  </div>
                )}
                {isPossibleMove && <div className="move-dot" />}
              </div>
            );
          })
        ))}
      </div>
      <div className="coordinates">
        <div className="files">
          {(playerColor === 'black' ? files.slice().reverse() : files).map(file => (
            <div key={file}>{file}</div>
          ))}
        </div>
        <div className="ranks">
          {(playerColor === 'black' ? ranks.slice().reverse() : ranks).map(rank => (
            <div key={rank}>{rank}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChessBoard;
