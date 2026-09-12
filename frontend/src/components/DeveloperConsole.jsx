import React, { useState, useEffect } from 'react';
import { Terminal, Users, Cpu, ShieldCheck, RefreshCw, AlertTriangle, ArrowUpRight, Trash2, X } from 'lucide-react';

export const DeveloperConsole = () => {
  const [logs, setLogs] = useState([]);
  const [logType, setLogType] = useState('combined');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Delete User Modal State
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDeveloperData = async () => {
    try {
      setLoading(true);

      // Fetch System Stats
      const statsRes = await fetch('/api/developer/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch Logs
      const logsRes = await fetch(`/api/developer/logs?type=${logType}`);
      const logsData = await logsRes.json();
      if (logsData.success) setLogs(logsData.logs || []);

      // Fetch Users
      const usersRes = await fetch('/api/developer/users');
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users || []);

    } catch (err) {
      console.error('Failed to load developer console telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeveloperData();
  }, [logType]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionMessage('');
      const res = await fetch(`/api/developer/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Role updated successfully for user.`);
        fetchDeveloperData();
      } else {
        setActionMessage(`Failed to update role: ${data.error}`);
      }
    } catch (err) {
      setActionMessage(`Role change error: ${err.message}`);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;

    try {
      setDeleteLoading(true);
      setActionMessage('');
      const res = await fetch(`/api/developer/users/${deleteTargetUser.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || `User '${deleteTargetUser.email}' deleted successfully.`);
        setDeleteTargetUser(null);
        fetchDeveloperData();
      } else {
        setActionMessage(`Failed to delete user: ${data.error}`);
      }
    } catch (err) {
      setActionMessage(`User deletion error: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700 }}>
            Developer System Console
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Role-Based Access Control (RBAC) Telemetry & Log Monitoring
          </p>
        </div>
        <button onClick={fetchDeveloperData} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {actionMessage && (
        <div className="alert alert-success">
          <ShieldCheck size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* System Telemetry Cards Grid */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Environment</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-primary)' }}>
              {stats.environment}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>MongoDB Status</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-accent-green)' }}>
              {stats.dbStatus}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Total Users / Devs</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>
              {stats.totalUsers} ({stats.developerUsers} Devs)
            </div>
          </div>
          <div className="glass-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Heap Memory</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: 'var(--color-developer-purple)' }}>
              {stats.memoryUsageMB?.heapUsed} MB
            </div>
          </div>
        </div>
      )}

      {/* Live Log Terminal Stream */}
      <div className="glass-card" style={{ maxWidth: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--color-accent-green)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Winston System Logs</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setLogType('combined')}
              className={`btn ${logType === 'combined' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Combined Logs
            </button>
            <button
              onClick={() => setLogType('error')}
              className={`btn ${logType === 'error' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              Error Logs
            </button>
          </div>
        </div>

        <div className="log-terminal">
          {logs.length === 0 ? (
            <div>No log entries found.</div>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} className="log-entry">
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass-card" style={{ maxWidth: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Users size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Registered System Accounts & Roles</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Current Role</th>
                <th>RBAC Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ textTransform: 'capitalize' }}>{u.authProvider}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'developer' ? 'badge-developer' : 'badge-user'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {u.role === 'user' ? (
                        <button
                          onClick={() => handleRoleChange(u.id, 'developer')}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: 'var(--color-developer-purple)' }}
                        >
                          Promote to Dev
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u.id, 'user')}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        >
                          Demote to User
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteTargetUser(u)}
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        title={`Purge ${u.email}`}
                      >
                        <Trash2 size={13} />
                        <span>Purge</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Glassmorphism User Deletion Modal */}
      {deleteTargetUser && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div className="glass-card" style={{ maxWidth: '460px', width: '100%', borderColor: 'var(--color-accent-red)', position: 'relative' }}>
            <button
              onClick={() => setDeleteTargetUser(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 59, 48, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-accent-red)'
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent-red)' }}>
                Purge User Account & Data
              </h3>
            </div>

            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <span>⚠️ <strong>Developer Security Warning:</strong> You are about to permanently delete user <strong>{deleteTargetUser.email}</strong> and purge all active session tokens from MongoDB.</span>
            </div>

            <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.85rem' }}>
              <div><strong>Name:</strong> {deleteTargetUser.name}</div>
              <div><strong>Email:</strong> {deleteTargetUser.email}</div>
              <div><strong>Role:</strong> <span style={{ textTransform: 'uppercase' }}>{deleteTargetUser.role}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                {deleteLoading ? 'Purging User...' : 'Permanently Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
