import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, X, Mail, User as UserIcon } from 'lucide-react';
import { API_BASE } from '../config/api';

export const GoogleAuthButton = () => {
  const { googleLogin } = useAuth();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [resolvedClientId, setResolvedClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

  // Fetch clientId from backend if not provided in build env
  useEffect(() => {
    if (!resolvedClientId) {
      fetch(`${API_BASE}/api/auth/google/client-id`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.clientId) {
            setResolvedClientId(data.clientId);
          }
        })
        .catch(err => console.warn('Could not fetch Google Client ID from backend:', err));
    }
  }, [resolvedClientId]);

  const initGoogleClient = (clientId) => {
    if (!clientId || !window.google?.accounts?.oauth2) return null;
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Google OAuth token error:', tokenResponse);
            alert(`Google Sign-In Error: ${tokenResponse.error_description || tokenResponse.error}\n\nMake sure "${window.location.origin}" is added to Authorized JavaScript Origins in Google Cloud Console.`);
            return;
          }

          if (tokenResponse.access_token) {
            setLoading(true);
            try {
              // Fetch verified profile from Google UserInfo API
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await res.json();

              await googleLogin({
                email: userInfo.email,
                name: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
                avatar: userInfo.picture || '',
                googleId: userInfo.sub
              });
            } catch (err) {
              console.error('Google profile fetch error:', err);
              alert(`Google Login error: ${err.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      });
      return client;
    } catch (err) {
      console.warn('Google OAuth init error:', err);
      return null;
    }
  };

  useEffect(() => {
    if (resolvedClientId) {
      const client = initGoogleClient(resolvedClientId);
      if (client) {
        setTokenClient(client);
      } else {
        // Retry shortly if the external script is still loading
        const timer = setTimeout(() => {
          const retryClient = initGoogleClient(resolvedClientId);
          if (retryClient) setTokenClient(retryClient);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [resolvedClientId]);

  const handleGoogleClick = () => {
    let client = tokenClient;
    if (!client && resolvedClientId && window.google?.accounts?.oauth2) {
      client = initGoogleClient(resolvedClientId);
      if (client) setTokenClient(client);
    }

    if (client) {
      // Trigger official Google OAuth 2.0 popup window
      client.requestAccessToken({ prompt: 'select_account' });
    } else {
      // Fallback: Open interactive prompt modal for dev testing without Client ID
      setShowPromptModal(true);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail) {
      alert('Please enter your Google Email.');
      return;
    }

    try {
      setLoading(true);
      await googleLogin({
        email: googleEmail.trim(),
        name: googleName.trim() || googleEmail.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${googleEmail}`,
        googleId: `google_oauth_${Date.now()}`
      });
      setShowPromptModal(false);
    } catch (err) {
      alert(`Google Auth error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Custom Theme-Matched Glassmorphism Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="btn btn-secondary btn-full"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontWeight: 600,
          padding: '13px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-glass)',
          background: 'var(--bg-input)',
          borderColor: 'var(--border-glass)'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
      </button>

      {/* Interactive Google Account Tester Modal (Fallback mode) */}
      {showPromptModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', position: 'relative' }}>
            <button
              onClick={() => setShowPromptModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Google Sign-In Account Prompt</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Enter your Google Account email and name below to test account creation & login:
            </p>

            <form onSubmit={handleCustomGoogleSubmit}>
              <div className="form-group">
                <label className="form-label">Google Account Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="form-input"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Display Name</label>
                <div className="input-wrapper">
                  <UserIcon className="input-icon" size={18} />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="John Doe"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowPromptModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Authenticate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
