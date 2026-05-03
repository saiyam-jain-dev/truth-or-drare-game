import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      setIsLoading(true);
      const res = await login(formData.username, formData.password);
      setIsLoading(false);
      if (res.success) {
        navigate('/home');
      } else {
        setError(res.message);
      }
    } else {
      // Register flow
      if (!showOtp) {
        // First step of register: get username/password, show OTP
        if (!formData.username || !formData.password) {
          setError('Please fill in all fields');
          return;
        }
        setIsLoading(true);
        const res = await register(formData.username, formData.password);
        setIsLoading(false);
        if (res.success) {
          setShowOtp(true); // Show OTP after successful registration
        } else {
          setError(res.message);
        }
      } else {
        // Second step: OTP entered (accept any OTP)
        // User is already registered and logged in from the previous step
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          navigate('/home');
        }, 1000); // Small mock delay for OTP verification
      }
    }
  };

  return (
    <div className="page-container">
      <div className="auth-container glass-panel">
        <h2 className="text-gradient" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>
          {isLogin ? 'Welcome Back' : 'Join the Game'}
        </h2>
        
        {error && <p style={{ color: 'var(--accent-pink)', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {!showOtp ? (
            <>
              <div className="input-group">
                <label>Instagram Username</label>
                <input
                  type="text"
                  name="username"
                  className="neon-input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="@yourusername"
                  required
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  className="neon-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <div className="input-group">
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                className="neon-input"
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                required
              />
              <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                (Enter OTP sent to your mobile number)
              </p>
              <p style={{ color: 'var(--accent-pink)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
                It might take 30sec to receive OTP
              </p>
            </div>
          )}

          <button type="submit" className="btn-neon" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : (showOtp ? 'Verify & Register' : 'Continue'))}
          </button>
        </form>

        {showOtp && (
           <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                type="button"
                onClick={() => setShowOtp(false)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Invalid credentials? Go back
              </button>
           </div>
        )}

        {!showOtp && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
