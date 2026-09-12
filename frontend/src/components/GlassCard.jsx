import React from 'react';

export const GlassCard = ({ children, className = '', wide = false, style = {}, onClick, ...rest }) => {
  return (
    <div
      className={`glass-card ${wide ? 'glass-card-wide' : ''} ${className}`}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

