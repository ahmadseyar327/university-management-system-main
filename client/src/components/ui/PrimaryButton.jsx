import React from 'react';

export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  );
}

