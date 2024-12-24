const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Chess } = require('chess.js');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const games = new Map();
const players = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createGame', (playerName) => {
    try {
      const gameId = Math.random().toString(36).substring(2, 8);
      const chess = new Chess();
      
      games.set(gameId, {
        chess: chess,
        players: {
          white: { id: socket.id, name: playerName, timeLeft: 600 },
          black: null
        },
        moves: [],
        status: 'waiting',
        timer: null
      });
      
      players.set(socket.id, gameId);
      socket.join(gameId);
      socket.emit('gameCreated', { gameId, color: 'white' });
      console.log('Game created:', gameId);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', 'Failed to create game');
    }
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    try {
      const game = games.get(gameId);
      
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }
      
      if (game.status !== 'waiting') {
        socket.emit('error', 'Game is already full');
        return;
      }

      game.players.black = { 
        id: socket.id, 
        name: playerName, 
        timeLeft: 600  
      };
      game.status = 'playing';
      players.set(socket.id, gameId);
      socket.join(gameId);
      
      socket.emit('gameJoined', { gameId, color: 'black' });
      
      // Send game start to both players
      io.to(gameId).emit('gameStart', {
        players: {
          white: game.players.white.name,
          black: game.players.black.name
        },
        board: game.chess.board(),
        whiteTime: game.players.white.timeLeft,
        blackTime: game.players.black.timeLeft
      });

      // Start the timer
      game.timer = setInterval(() => {
        const currentPlayer = game.chess.turn() === 'w' ? 'white' : 'black';
        game.players[currentPlayer].timeLeft--;

        // Check for time out
        if (game.players[currentPlayer].timeLeft <= 0) {
          clearInterval(game.timer);
          const winner = currentPlayer === 'white' ? 'black' : 'white';
          io.to(gameId).emit('gameOver', {
            status: 'timeout',
            winner: winner,
            winnerName: game.players[winner].name
          });
          games.delete(gameId);
          return;
        }

        // Emit time update
        io.to(gameId).emit('timeUpdate', {
          whiteTime: game.players.white.timeLeft,
          blackTime: game.players.black.timeLeft
        });
      }, 1000);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  socket.on('move', ({ gameId, from, to }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit('error', 'Game not found');
        return;
      }

      const chess = game.chess;
      
      // Get the piece at the 'from' square
      const piece = chess.get(from);
      if (!piece) {
        socket.emit('error', 'No piece at source square');
        return;
      }

      // Check if the move follows basic piece movement rules
      const moves = chess.moves({ square: from, verbose: true });
      const isValidPieceMove = moves.some(m => m.to === to);

      if (!isValidPieceMove) {
        socket.emit('error', 'Invalid piece movement');
        return;
      }

      // Make a copy of the current position
      const fen = chess.fen();
      
      // Try to make the move
      let move = chess.move({ from, to, promotion: 'q' });
      
      // If the move wasn't successful (due to check/checkmate validation)
      if (!move) {
        // Create a new Chess instance with the saved position
        const tempChess = new Chess(fen);
        
        // Force the move without validation
        move = tempChess.move({ from, to, promotion: 'q' });
        
        if (move) {
          // If the forced move was successful, update the main chess instance
          chess.load(tempChess.fen());
        } else {
          socket.emit('error', 'Invalid move');
          return;
        }
      }

      // Add move to history
      game.moves.push(move);

      const gameState = {
        board: chess.board(),
        currentTurn: chess.turn() === 'w' ? 'white' : 'black',
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw(),
        moves: game.moves,
        whiteTime: game.players.white.timeLeft,
        blackTime: game.players.black.timeLeft,
        capture: move.captured ? true : false
      };

      // Emit the updated game state
      io.to(gameId).emit('moveMade', gameState);

      // Check if game is over
      if (chess.isGameOver()) {
        clearInterval(game.timer);
        let result;
        if (chess.isCheckmate()) {
          const winner = chess.turn() === 'w' ? 'black' : 'white';
          result = {
            status: 'checkmate',
            winner: winner,
            winnerName: game.players[winner].name
          };
        } else if (chess.isDraw()) {
          result = {
            status: 'draw',
            reason: chess.isInsufficientMaterial() ? 'insufficient material' : 'draw'
          };
        }
        io.to(gameId).emit('gameOver', result);
        games.delete(gameId);
      }
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('error', 'Failed to make move');
    }
  });

  socket.on('disconnect', () => {
    const gameId = players.get(socket.id);
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        clearInterval(game.timer);
        const playerName = 
          game.players.white?.id === socket.id ? game.players.white.name :
          game.players.black?.id === socket.id ? game.players.black.name :
          'Unknown player';
        
        io.to(gameId).emit('playerLeft', playerName);
        games.delete(gameId);
      }
      players.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
