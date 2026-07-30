import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordRequirements from '../components/PasswordRequirements';
import { checkPassword } from '../utils/passwordPolicy';

export default function CreateAccountScreen({ onNavigate }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { valid: passwordValid } = checkPassword(password);
  const passwordsMatch = !!password && password === confirmPassword;
  const canSubmit =
    username.trim().length >= 3 &&
    passwordValid &&
    passwordsMatch &&
    !!securityQuestion.trim() &&
    !!securityAnswer.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        password,
        securityQuestion: securityQuestion.trim(),
        securityAnswer: securityAnswer.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="auth-title">Create Login</p>
        <p className="auth-subtitle">Set up a new account</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label">Username</label>
          <input
            className="field-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            autoComplete="username"
            autoFocus
          />

          <label className="field-label">Password Requirements</label>
          <PasswordRequirements password={password} />

          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          <label className="field-label">Confirm Password</label>
          <input
            className="field-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
          {confirmPassword && !passwordsMatch && <p className="auth-error">Passwords do not match</p>}

          <label className="field-label">Security Question</label>
          <input
            className="field-input"
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            placeholder="e.g. What was your first pet's name?"
          />

          <label className="field-label">Security Answer</label>
          <input
            className="field-input"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="Answer (used later to reset your password)"
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 16 }}
            type="submit"
            disabled={loading || !canSubmit}
          >
            {loading ? 'Creating…' : 'Create Login'}
          </button>
        </form>

        <button className="link-btn" onClick={() => onNavigate('login')}>
          Already have a login? Log In
        </button>
      </div>
    </div>
  );
}
