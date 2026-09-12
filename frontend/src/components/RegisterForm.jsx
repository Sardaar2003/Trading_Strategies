import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthButton } from './GoogleAuthButton';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, CheckCircle } from 'lucide-react';

export const RegisterForm = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength score 0 to 100
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 30;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 15;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;
    return Math.min(100, score);
  };

  const strength = calculateStrength(password);
  const getStrengthColor = (s) => {
    if (s < 40) return '#ff3b30';
    if (s < 70) return '#f59e0b';
    return '#00c853';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, role);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
      {errorMessage && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div className="input-wrapper">
          <UserIcon className="input-icon" size={18} />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div className="input-wrapper">
          <Mail className="input-icon" size={18} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@trading.com"
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
            placeholder="Create a strong password"
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
        {password.length > 0 && (
          <div className="strength-bar">
            <div
              className="strength-fill"
              style={{
                width: `${strength}%`,
                backgroundColor: getStrengthColor(strength)
              }}
            />
          </div>
        )}
      </div>

      {/* Role Selection Switch */}
      <div className="form-group">
        <label className="form-label">Select Account Role</label>
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`btn ${role === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px 12px', fontSize: '0.85rem' }}
          >
            <UserIcon size={16} /> User (Trader)
          </button>
          <button
            type="button"
            onClick={() => setRole('developer')}
            className={`btn ${role === 'developer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px 12px', fontSize: '0.85rem' }}
          >
            <Shield size={16} /> Developer (RBAC)
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? (
          <span>Creating Account...</span>
        ) : (
          <>
            <CheckCircle size={18} />
            <span>Create Trading Account</span>
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
