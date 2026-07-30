import React, { useState } from 'react';
import { getSecurityQuestion, resetPassword as apiResetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PasswordRequirements from '../components/PasswordRequirements';
import { checkPassword } from '../utils/passwordPolicy';

export default function ResetPasswordScreen({ onNavigate }) {
  const { setSessionUser } = useAuth();
  const [step, setStep] = useState('username'); // 'username' | 'answer'
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestionText] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFindAccount = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { securityQuestion: q } = await getSecurityQuestion(username.trim());
      setSecurityQuestionText(q);
      setStep('answer');
    } catch (err) {
      setError(err.response?.data?.error || 'No account found for that username.');
    } finally {
      setLoading(false);
    }
  };

  const { valid: passwordValid } = checkPassword(newPassword);
  const passwordsMatch = !!newPassword && newPassword === confirmPassword;
  const canSubmit = !!securityAnswer.trim() && passwordValid && passwordsMatch;

  const handleReset = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const user = await apiResetPassword({
        username: username.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword,
      });
      setSessionUser(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <p className="auth-title">Reset Password</p>

        {step === 'username' ? (
          <>
            <p className="auth-subtitle">Enter your username to continue</p>
            <form onSubmit={handleFindAccount}>
              <label className="field-label">Username</label>
              <input
                className="field-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="username"
                autoFocus
              />

              {error && <p className="auth-error">{error}</p>}

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                type="submit"
                disabled={loading || !username.trim()}
              >
                {loading ? 'Looking up…' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-subtitle">{securityQuestion}</p>
            <form onSubmit={handleReset}>
              <label className="field-label">Your Answer</label>
              <input
                className="field-input"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Answer"
                autoFocus
              />

              <label className="field-label">New Password Requirements</label>
              <PasswordRequirements password={newPassword} />

              <label className="field-label">New Password</label>
              <input
                className="field-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a new password"
                autoComplete="new-password"
              />

              <label className="field-label">Confirm New Password</label>
              <input
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              {confirmPassword && !passwordsMatch && <p className="auth-error">Passwords do not match</p>}

              {error && <p className="auth-error">{error}</p>}

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                type="submit"
                disabled={loading || !canSubmit}
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <button className="link-btn" onClick={() => onNavigate('login')}>
          Back to Log In
        </button>
      </div>
    </div>
  );
}
