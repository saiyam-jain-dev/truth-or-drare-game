import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const [roomCode, setRoomCode] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // Generate a random 6 character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.toUpperCase()}`);
    }
  };

  if (!user) return <Navigate to="/" />;

  return (
    <div className="page-container">
      <div className="home-container glass-panel" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className="text-gradient" style={{ margin: 0 }}>Hello, {user.username}</h2>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-pink)' }}>Start a New Game</h3>
          <button className="btn-neon" onClick={handleCreateRoom}>
            Create Room
          </button>
        </div>

        <div style={{ position: 'relative', margin: '2rem 0' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-color)', padding: '0 10px', color: '#888', fontSize: '0.9rem' }}>
            OR
          </span>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-purple)' }}>Join a Game</h3>
          <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="neon-input"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="ENTER CODE"
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
              maxLength={6}
              required
            />
            <button type="submit" className="btn-neon purple" style={{ width: 'auto', padding: '1rem' }}>
              Join
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
