import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from './GoogleAuthButton';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

export const SignInForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="trader@apex.com"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrapper">
          <Lock className="input-icon" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="form-input"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? (
          <span>Signing in...</span>
        ) : (
          <>
            <span>Access Trading Terminal</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
      </div>

      <GoogleAuthButton />
    </form>
  );
};
