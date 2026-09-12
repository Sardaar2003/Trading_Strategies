import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        padding: '8px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.85rem'
      }}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={16} style={{ color: '#f59e0b' }} />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon size={16} style={{ color: '#8b5cf6' }} />
          <span>Dark</span>
        </>
      )}
    </button>
  );
};
