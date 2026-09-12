import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Key, AlertTriangle, Trash2, X } from 'lucide-react';

export const SessionSecurityModal = ({ isOpen, onClose }) => {
  const { user, sessionInfo, deleteAccount } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (deleteText.trim().toUpperCase() !== 'DELETE') return;
    try {
      setDeleteLoading(true);
      await deleteAccount();
      onClose();
    } catch (err) {
      alert(`Account deletion failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '24px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '32px',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass), 0 20px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Close Modal"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Lock size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Session & Security Settings
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', margin: '4px 0 0 0' }}>
              Manage active session telemetry, security tokens, and account controls.
            </p>
          </div>
        </div>

        {/* User Badge */}
        <div
          style={{
            background: 'var(--bg-input)',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid var(--border-glass)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
              color: '#0b0e14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>{user?.email}</div>
          </div>
        </div>

        {/* Active Session Telemetry */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={16} color="var(--color-primary)" /> Active Session Telemetry
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Session ID</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.775rem', marginTop: '4px', wordBreak: 'break-all', color: 'var(--text-main)' }}>
                {sessionInfo?.sessionId || 'Active HTTP Cookie Session'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cookie Security</span>
              <div style={{ color: '#00c853', fontWeight: 700, fontSize: '0.8rem', marginTop: '4px' }}>
                HttpOnly: True • SameSite: Lax
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone: Account Deletion */}
        <div
          style={{
            borderRadius: '14px',
            border: '1px solid rgba(255, 59, 48, 0.4)',
            background: 'rgba(255, 59, 48, 0.05)',
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ff3b30', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Permanent Account Deletion
              </h4>
              <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                Permanently delete account & user data. Cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 59, 48, 0.15)',
                color: '#ff3b30',
                border: '1px solid rgba(255, 59, 48, 0.4)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>

          {/* Inline Deletion Confirmation Input */}
          {showDeleteConfirm && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255, 59, 48, 0.3)' }}>
              <p style={{ fontSize: '0.8rem', color: '#ff3b30', fontWeight: 700, marginBottom: '8px' }}>
                Type "DELETE" to confirm account deletion:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder='Type "DELETE"'
                  style={{
                    flex: 1,
                    minWidth: '160px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    border: '1px solid rgba(255, 59, 48, 0.5)',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleDelete}
                  disabled={deleteText.trim().toUpperCase() !== 'DELETE' || deleteLoading}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#ff3b30',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: deleteText.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed',
                    opacity: deleteText.trim().toUpperCase() === 'DELETE' ? 1 : 0.5
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-subtle)',
                    border: '1px solid var(--border-glass)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
