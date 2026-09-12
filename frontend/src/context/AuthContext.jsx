import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSessionInfo(data.sessionInfo || null);
      } else {
        setUser(null);
        setSessionInfo(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setUser(null);
      setSessionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (name, email, password, requestedRole = 'user') => {
    try {
      setError(null);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, requestedRole })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      setUser(data.user);
      await checkAuth();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      await checkAuth();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const googleLogin = async (googleUserData) => {
    try {
      setError(null);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUserData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Google auth failed');
      }
      setUser(data.user);
      await checkAuth();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request error:', err);
    } finally {
      setUser(null);
      setSessionInfo(null);
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }
      setUser(null);
      setSessionInfo(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isDeveloper = user?.role === 'developer';

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionInfo,
        loading,
        error,
        setError,
        register,
        login,
        googleLogin,
        logout,
        deleteAccount,
        checkAuth,
        isDeveloper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
