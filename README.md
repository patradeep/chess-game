# Real-Time Multiplayer Chess Game

A modern, real-time multiplayer chess game built with React, Node.js, and Socket.IO. Play chess with friends online with a beautiful, responsive interface.

## Features

- Real-time multiplayer gameplay
- Beautiful responsive design
- Move validation with unique features:
  - Allows moves that put your own king in check
  - Allows moves that lead to checkmate
  - Shows possible moves for each piece
- Game timer for each player
- Sound effects for moves and captures
- Game state tracking (check, checkmate, draw)

## Tech Stack

- Frontend:
  - React
  - Vite
  - Socket.IO Client
  - CSS3 with modern features

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - chess.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
cd chess-game
```

2. Install dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies (if separated)
cd client
npm install
```

3. Start the development server
```bash
# Start the backend server
node server.js

# In a new terminal, start the frontend
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. Create a new game
2. Share the game ID with your friend
3. Your friend joins using the game ID
4. White moves first
5. Make moves by:
   - Clicking a piece to see possible moves
   - Clicking a highlighted square to move

## Deployment

The game can be deployed on any platform that supports Node.js:
- Frontend: Vercel, Netlify, GitHub Pages
- Backend: Heroku, DigitalOcean, AWS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Chess.js for chess logic
- Socket.IO for real-time communication
- React community for inspiration and support
