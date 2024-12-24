import { useState } from 'react';

function Login({ onCreateGame, onJoinGame }) {
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    if (isJoining) {
      if (!gameId) return;
      onJoinGame(name, gameId);
    } else {
      onCreateGame(name);
    }
  };

  return (
    <div className="login-container">
      <h1>Chess Game</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        {isJoining && (
          <div className="input-group">
            <label htmlFor="gameId">Game ID</label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter game ID"
              required
            />
          </div>
        )}

        <button type="submit" disabled={!name || (isJoining && !gameId)}>
          {isJoining ? 'Join Game' : 'Create Game'}
        </button>

        <button 
          type="button" 
          onClick={() => setIsJoining(!isJoining)}
          className="secondary"
        >
          {isJoining ? 'Create a new game instead?' : 'Join an existing game?'}
        </button>
      </form>
    </div>
  );
}

export default Login;
