import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginCard({ title, subtitle, children, backTo = '/', backLabel = 'Back to home' }) {
  return (
    <div className="w-full max-w-md auth-card-enter">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="bg-blue-700 text-white text-center px-6 py-6 auth-card-header">
          <h1 className="text-2xl font-bold m-0">{title}</h1>
          {subtitle ? (
            <p className="text-blue-100 text-sm mt-1 mb-0">{subtitle}</p>
          ) : null}
        </div>
        <div className="px-8 py-7">{children}</div>
      </div>
      <Link
        to={backTo}
        className="auth-link-enter block text-center mt-5 text-sm text-gray-500 hover:text-blue-700 transition-colors no-underline"
      >
        &larr; {backLabel}
      </Link>
    </div>
  );
}
