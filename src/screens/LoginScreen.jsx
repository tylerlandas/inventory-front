import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const USERNAME_ONLY_LOGIN_KEY = 'homeinventory.usernameOnlyLogin';

function getStoredUsernameOnlyLogin() {
  try {
    return localStorage.getItem(USERNAME_ONLY_LOGIN_KEY) === 'true';
  } catch {
    return false;
  }
}

function storeUsernameOnlyLogin(value) {
  try {
    localStorage.setItem(USERNAME_ONLY_LOGIN_KEY, String(value));
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export default function LoginScreen({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('testing321');
  const [password, setPassword] = useState('Badpuppy1!4321');
  const [usernameOnlyLogin, setUsernameOnlyLogin] = useState(getStoredUsernameOnlyLogin);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleUsernameOnlyLogin = () => {
    setUsernameOnlyLogin((prev) => {
      const next = !prev;
      storeUsernameOnlyLogin(next);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || (!usernameOnlyLogin && !password)) return;
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), usernameOnlyLogin ? undefined : password);
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

          {!usernameOnlyLogin && (
            <>
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
              />
            </>
          )}

          <label className="switch-row">
            <span>Log in with username only</span>
            <span className="switch">
              <input
                type="checkbox"
                role="switch"
                checked={usernameOnlyLogin}
                onChange={toggleUsernameOnlyLogin}
                aria-label="Log in with username only"
              />
              <span className="switch-track" />
            </span>
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            type="submit"
            disabled={loading || !username.trim() || (!usernameOnlyLogin && !password)}
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
