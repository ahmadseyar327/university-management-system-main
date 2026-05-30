import React from 'react';
import LoginLayout from '../layouts/LoginLayout';
import RoleCard from '../components/cards/RoleCard';

export default function Home() {
  return (
    <LoginLayout>
      <div className="w-full max-w-2xl text-center auth-home-enter">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">Welcome</h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Select your role to sign in</p>
        <div className="grid gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
          <RoleCard
            role="student"
            title="Student"
            description="View courses, attendance, and grades"
            path="/student/login"
          />
          <RoleCard
            role="instructor"
            title="Instructor"
            description="Manage courses, attendance, and marks"
            path="/instructor/login"
          />
        </div>
      </div>
    </LoginLayout>
  );
}
