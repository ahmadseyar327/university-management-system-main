import React from 'react';
import { Link } from 'react-router-dom';

function InstructorIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

const roleIcons = {
  instructor: InstructorIcon,
  student: StudentIcon,
  admin: AdminIcon,
};

export default function RoleCard({ title, description, path, role }) {
  const Icon = roleIcons[role] || StudentIcon;

  return (
    <Link
      to={path}
      className="auth-role-card group block bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 p-6 shadow-md hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 text-left no-underline"
    >
      <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:text-white group-hover:scale-110 transition-all duration-300">
        <Icon />
      </div>
      <h3 className="text-lg font-semibold text-blue-900 m-0">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-0">{description}</p>
      <span className="inline-block mt-4 text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:translate-x-1 transition-all duration-300">
        Sign in &rarr;
      </span>
    </Link>
  );
}
