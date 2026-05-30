import React from 'react';

export default function FadeInPanel({ children, className = '', delay = 0 }) {
  return (
    <div
      className={`academics-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
