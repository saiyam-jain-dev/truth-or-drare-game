import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { questionsData } from '../data/questions';

const Room = () => {
  const { id: roomCode } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('romantic');
  
  // To ensure we only connect once
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      socketRef.current = io(BACKEND_URL);
      setSocket(socketRef.current);
    }

    const s = socketRef.current;

    s.emit('join_room', { roomCode, username: user.username });

    s.on('room_update', (data) => setRoomState(data));
    s.on('game_start', (data) => setRoomState(data));
    s.on('action_chosen', (data) => setRoomState(data));
    s.on('turn_update', (data) => setRoomState(data));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, user, navigate]);

  if (!user) return <Navigate to="/" />;
  if (!roomState) return <div className="page-container"><div className="text-gradient">Loading...</div></div>;

  const handleAction = (action) => {
    const list = questionsData[selectedCategory][action + 's']; // 'truths' or 'dares'
    const randomItem = list[Math.floor(Math.random() * list.length)];
    
    socket.emit('choose_action', { roomCode, action, question: randomItem, category: selectedCategory });
  };

  const handleNextTurn = () => {
    socket.emit('next_turn', { roomCode });
  };

  const isMyTurn = roomState.players[roomState.turnIndex]?.username === user?.username;
  const partner = roomState.players.find(p => p.username !== user?.username);

  return (
    <div className="page-container">
      <div className="room-container glass-panel">
        <div className="room-header">
          <div className="room-header-stats">
            <span style={{ color: '#888' }}>Room: <strong style={{ color: 'white' }}>{roomCode}</strong></span>
            <span style={{ color: '#888' }}>Players: <strong style={{ color: 'white' }}>{roomState.players.length}/2</strong></span>
          </div>
          <div className="room-header-buttons">
            <button 
              onClick={() => navigate('/home')} 
              style={{ background: 'none', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(0, 240, 255, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              Leave Room
            </button>
            <button 
              onClick={logout} 
              style={{ background: 'none', border: '1px solid var(--accent-pink)', color: 'var(--accent-pink)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', transition: 'all 0.3s ease' }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 0, 127, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              Logout
            </button>
          </div>
        </div>

        {roomState.gameState === 'waiting' && (
          <div style={{ padding: '3rem 1rem' }}>
            <h2 className="text-gradient" style={{ marginBottom: '2rem' }}>Waiting for partner...</h2>
            <div className="waiting-pulse" style={{ 
              width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
            }}>
              ❤️
            </div>
            <p style={{ marginTop: '2rem', color: '#aaa' }}>Share the room code with your partner.</p>
          </div>
        )}

        {roomState.gameState !== 'waiting' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  background: isMyTurn ? 'var(--accent-pink)' : 'var(--glass-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.5rem', border: isMyTurn ? 'none' : '1px solid var(--glass-border)',
                  boxShadow: isMyTurn ? '0 0 15px var(--accent-pink)' : 'none'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: isMyTurn ? 'white' : '#888' }}>You</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', 
                  background: !isMyTurn ? 'var(--accent-purple)' : 'var(--glass-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.5rem', border: !isMyTurn ? 'none' : '1px solid var(--glass-border)',
                  boxShadow: !isMyTurn ? '0 0 15px var(--accent-purple)' : 'none'
                }}>
                  {partner ? partner.username.charAt(0).toUpperCase() : '?'}
                </div>
                <span style={{ color: !isMyTurn ? 'white' : '#888' }}>{partner ? partner.username : 'Partner'}</span>
              </div>
            </div>

            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {roomState.gameState === 'action_selection' && (
                <>
                  {isMyTurn ? (
                    <>
                      <h2 style={{ marginBottom: '1rem' }}>Your Turn!</h2>
                      <div style={{ marginBottom: '2rem' }}>
                        <p style={{ color: '#aaa', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Select Vibe</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          {['casual', 'romantic', 'erotic'].map(cat => (
                            <button 
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              style={{
                                background: selectedCategory === cat ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: `1px solid ${selectedCategory === cat ? 'white' : '#555'}`,
                                color: selectedCategory === cat ? 'white' : '#888',
                                padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.3s'
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="actions-container">
                        <button className="btn-neon blue" onClick={() => handleAction('truth')}>Truth</button>
                        <button className="btn-neon pink" onClick={() => handleAction('dare')}>Dare</button>
                      </div>
                    </>
                  ) : (
                    <h2 className="text-gradient">Waiting for {partner.username} to choose...</h2>
                  )}
                </>
              )}

              {roomState.gameState === 'answering' && (
                <>
                  <h3 style={{ 
                    color: roomState.currentAction === 'truth' ? 'var(--accent-blue)' : 'var(--accent-pink)',
                    textTransform: 'uppercase', letterSpacing: '2px' 
                  }}>
                    {roomState.category} {roomState.currentAction}
                  </h3>
                  <div className="question-display">
                    "{roomState.currentQuestion}"
                  </div>
                  
                  {isMyTurn && (
                    <button className="btn-neon" style={{ marginTop: '2rem', maxWidth: '200px', margin: '2rem auto 0' }} onClick={handleNextTurn}>
                      Done
                    </button>
                  )}
                  {!isMyTurn && (
                    <p style={{ color: '#aaa', marginTop: '2rem' }}>Waiting for {partner.username} to finish...</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
