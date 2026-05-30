import React from 'react';
import LoadingSpinner from '../components/spinners/LoadingSpinner';

export default function LoginLayout({ isLoading, children }) {
  return (
    <div className="auth-page min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />

      <div className="relative z-10 w-full flex items-center justify-center">
        {isLoading ? <LoadingSpinner /> : children}
      </div>
    </div>
  );
}
