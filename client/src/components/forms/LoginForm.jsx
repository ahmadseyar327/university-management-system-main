import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { inputClass, labelClass, submitButtonClass } from './authFormStyles';

export default function LoginForm({
  loginDetails,
  setLoginDetails,
  login,
  domain,
}) {
  const [toggle, setToggle] = useState(true);

  const domainSubtitle = {
    student: 'Access your student portal',
    instructor: 'Access your instructor portal',
    admin: 'Access the admin dashboard',
  };

  return (
    <form onSubmit={(event) => login(event)} className="space-y-4">
      {domain === 'student' ? (
        <>
          <div className="auth-field">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Sign in with
            </p>
            <div className="flex rounded-lg bg-blue-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setToggle(true);
                  setLoginDetails({ ...loginDetails, email: '' });
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  toggle
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Roll Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setToggle(false);
                  setLoginDetails({ ...loginDetails, rollNumber: null });
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  !toggle
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          {toggle ? (
            <div className="auth-field">
              <label className={labelClass}>Roll Number</label>
              <input
                className={inputClass}
                type="text"
                placeholder="Enter your roll number"
                value={loginDetails.rollNumber ?? ''}
                onChange={(event) =>
                  setLoginDetails({
                    ...loginDetails,
                    rollNumber: event.target.value,
                  })
                }
                required
              />
            </div>
          ) : (
            <div className="auth-field">
              <label className={labelClass}>Email Address</label>
              <input
                className={inputClass}
                type="email"
                placeholder="you@university.edu"
                value={loginDetails.email}
                onChange={(event) =>
                  setLoginDetails({
                    ...loginDetails,
                    email: event.target.value,
                  })
                }
                required
              />
            </div>
          )}
        </>
      ) : (
        <div className="auth-field">
          <label className={labelClass}>Email Address</label>
          <input
            className={inputClass}
            type="email"
            placeholder="you@university.edu"
            value={loginDetails.email}
            onChange={(event) =>
              setLoginDetails({ ...loginDetails, email: event.target.value })
            }
            required
          />
        </div>
      )}

      <div className="auth-field">
        <label className={labelClass}>Password</label>
        <input
          className={inputClass}
          type="password"
          placeholder="Enter your password"
          value={loginDetails.password}
          onChange={(event) =>
            setLoginDetails({ ...loginDetails, password: event.target.value })
          }
          required
        />
      </div>

      {domain === 'student' ? (
        <div className="auth-field text-right">
          <Link
            to="/student/signup"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline no-underline transition-colors"
          >
            Create an account
          </Link>
        </div>
      ) : null}

      <button type="submit" className={submitButtonClass}>
        Sign In
      </button>

      <p className="auth-field text-center text-xs text-gray-400 pt-1 mb-0">
        {domainSubtitle[domain]}
      </p>
    </form>
  );
}
