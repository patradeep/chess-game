import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import Login from './components/Login';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
console.log('Connecting to server:', SERVER_URL); // Debug log

const socket = io(SERVER_URL, {
  path: '/socket.io/',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
  forceNew: true
});

// Debug socket connection
socket.on('connect', () => {
  console.log('Connected to server!', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

function App() {
  const moveSound = useRef(new Audio('/sounds/move.mp3'));
  const captureSound = useRef(new Audio('/sounds/capture.mp3'));
  const checkmateSound = useRef(new Audio('/sounds/checkmate.mp3'));

  const [gameState, setGameState] = useState({
    isPlaying: false,
    gameId: null,
    playerColor: null,
    currentTurn: 'white',
    board: null,
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    moves: [],
    whiteTime: 600,
    blackTime: 600
  });

  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  // Function to play sounds
  const playSound = (type) => {
    try {
      switch(type) {
        case 'move':
          moveSound.current.currentTime = 0;
          moveSound.current.play();
          break;
        case 'capture':
          captureSound.current.currentTime = 0;
          captureSound.current.play();
          break;
        case 'checkmate':
          checkmateSound.current.currentTime = 0;
          checkmateSound.current.play();
          break;
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setError('Failed to connect to server');
    });

    socket.on('gameCreated', ({ gameId, color }) => {
      console.log('Game created:', gameId);
      setGameState(prev => ({
        ...prev,
        gameId,
        playerColor: color
      }));
      setError('');
    });

    socket.on('gameJoined', ({ color, gameId }) => {
      console.log('Game joined:', gameId);
      setGameState(prev => ({
        ...prev,
        gameId,
        playerColor: color
      }));
      setError('');
    });

    socket.on('gameStart', ({ players, board, whiteTime, blackTime }) => {
      console.log('Game started');
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        board,
        whiteTime,
        blackTime
      }));
      setError('');
    });

    socket.on('moveMade', ({ board, currentTurn, isCheck, isCheckmate, isDraw, moves, whiteTime, blackTime, capture }) => {
      setGameState(prev => ({
        ...prev,
        board,
        currentTurn,
        isCheck,
        isCheckmate,
        isDraw,
        moves,
        whiteTime,
        blackTime
      }));

      // Play appropriate sound
      if (isCheckmate) {
        playSound('checkmate');
      } else if (capture) {
        playSound('capture');
      } else {
        playSound('move');
      }
    });

    socket.on('timeUpdate', ({ whiteTime, blackTime }) => {
      setGameState(prev => ({
        ...prev,
        whiteTime,
        blackTime
      }));
    });

    socket.on('gameOver', (result) => {
      if (result.status === 'checkmate') {
        playSound('checkmate');
        alert(`Game Over! ${result.winnerName} wins by checkmate!`);
      } else if (result.status === 'timeout') {
        alert(`Game Over! ${result.winnerName} wins on time!`);
      } else if (result.status === 'draw') {
        alert(`Game is a draw! Reason: ${result.reason}`);
      }
      setGameState({
        isPlaying: false,
        gameId: null,
        playerColor: null,
        currentTurn: 'white',
        board: null,
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        moves: [],
        whiteTime: 600,
        blackTime: 600
      });
    });

    socket.on('error', (message) => {
      console.error('Game error:', message);
      setError(message);
    });

    socket.on('playerLeft', (name) => {
      alert(`${name} has left the game`);
      setGameState({
        isPlaying: false,
        gameId: null,
        playerColor: null,
        currentTurn: 'white',
        board: null,
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        moves: [],
        whiteTime: 600,
        blackTime: 600
      });
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStart');
      socket.off('moveMade');
      socket.off('timeUpdate');
      socket.off('gameOver');
      socket.off('error');
      socket.off('playerLeft');
    };
  }, []);

  const createGame = (name) => {
    console.log('Creating game with name:', name);
    setPlayerName(name);
    socket.emit('createGame', name);
  };

  const joinGame = (name, gameId) => {
    console.log('Joining game:', gameId, 'with name:', name);
    setPlayerName(name);
    socket.emit('joinGame', { gameId, playerName: name });
  };

  const makeMove = (from, to) => {
    if (gameState.currentTurn !== gameState.playerColor) return;
    socket.emit('move', { gameId: gameState.gameId, from, to });
  };

  return (
    <div className="App">
      {error && <div className="error">{error}</div>}
      
      {!gameState.gameId ? (
        <Login onCreateGame={createGame} onJoinGame={joinGame} />
      ) : !gameState.isPlaying ? (
        <div className="waiting">
          <h2>Waiting for opponent...</h2>
          <p>Share this game ID with your friend: <span className="game-id">{gameState.gameId}</span></p>
        </div>
      ) : (
        <div className="game-container">
          <GameInfo
            moves={gameState.moves}
            playerColor={gameState.playerColor}
            currentTurn={gameState.currentTurn}
            whiteTime={gameState.whiteTime}
            blackTime={gameState.blackTime}
          />
          <ChessBoard
            board={gameState.board}
            playerColor={gameState.playerColor}
            onMove={makeMove}
            currentTurn={gameState.currentTurn}
          />
        </div>
      )}
    </div>
  );
}

export default App;
