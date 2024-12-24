import { useState, useEffect } from 'react';

function GameInfo({ moves, playerColor, currentTurn, whiteTime, blackTime, onTimeOut }) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLastFiveMoves = () => {
    return moves.slice(-5).reverse().map((move, index) => {
      const moveNumber = moves.length - index;
      return {
        number: moveNumber,
        notation: move.san,
        piece: move.piece,
        from: move.from,
        to: move.to,
        color: move.color === 'w' ? 'white' : 'black'
      };
    });
  };

  return (
    <div className="game-info">
      <div className="timers">
        <div className={`timer ${currentTurn === 'black' ? 'active' : ''}`}>
          Black: {formatTime(blackTime)}
        </div>
        <div className={`timer ${currentTurn === 'white' ? 'active' : ''}`}>
          White: {formatTime(whiteTime)}
        </div>
      </div>
      
      <div className="move-history">
        <h3>Last 5 Moves</h3>
        <div className="moves-list">
          {getLastFiveMoves().map((move) => (
            <div key={move.number} className={`move ${move.color}`}>
              {move.number}. {move.color === 'white' ? 'White' : 'Black'} - {move.notation}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameInfo;
