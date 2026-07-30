import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="auth-title">Home Inventory</p>
        <p className="auth-subtitle">Log in to your account</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Username</label>
          <input
            className="field-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            autoFocus
          />

          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            type="submit"
            disabled={loading || !username.trim() || !password}
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <button className="link-btn" onClick={() => onNavigate('reset')}>
          Reset Password
        </button>
        <button className="link-btn" onClick={() => onNavigate('create')}>
          Create Login
        </button>
      </div>
    </div>
  );
}
