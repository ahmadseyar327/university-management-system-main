import React from 'react';
import { Link } from 'react-router-dom';
import { inputClass, labelClass, submitButtonClass } from './authFormStyles';

export default function SignupForm({
  signupDetails,
  setSignupDetails,
  signup,
  update,
  variant = 'default',
  submitLabel,
  showLoginLink,
}) {
  if (variant === 'auth') {
    const buttonText =
      submitLabel || (update ? 'Save Changes' : 'Create Account');
    const displayLoginLink =
      showLoginLink !== undefined ? showLoginLink : !update;
    return (
      <form onSubmit={(event) => signup(event)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="auth-field">
            <label className={labelClass}>First Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="John"
              value={signupDetails.fname}
              onChange={(event) =>
                setSignupDetails({
                  ...signupDetails,
                  fname: event.target.value,
                })
              }
              required
            />
          </div>
          <div className="auth-field">
            <label className={labelClass}>Last Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Doe"
              value={signupDetails.lname}
              onChange={(event) =>
                setSignupDetails({
                  ...signupDetails,
                  lname: event.target.value,
                })
              }
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label className={labelClass}>Email Address</label>
          <input
            className={inputClass}
            type="email"
            placeholder="you@university.edu"
            value={signupDetails.email}
            onChange={(event) =>
              setSignupDetails({ ...signupDetails, email: event.target.value })
            }
            required
          />
        </div>

        <div className="auth-field">
          <label className={labelClass}>Password</label>
          <input
            className={inputClass}
            type="password"
            placeholder={update ? 'Enter new password' : 'Create a password'}
            value={signupDetails.password}
            onChange={(event) =>
              setSignupDetails({
                ...signupDetails,
                password: event.target.value,
              })
            }
            required
          />
        </div>

        {!displayLoginLink ? null : (
          <div className="auth-field text-right">
            <Link
              to="/student/login"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline no-underline transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        )}

        <button type="submit" className={submitButtonClass}>
          {buttonText}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => signup(event)}>
      <div className="row">
        <div className="col">
          <label className="form-label">First Name</label>
          <input
            className="form-control mb-4"
            type="text"
            value={signupDetails.fname}
            onChange={(event) =>
              setSignupDetails({
                ...signupDetails,
                fname: event.target.value,
              })
            }
            required
          />
        </div>
        <div className="col">
          <label className="form-label">Last Name</label>
          <input
            className="form-control mb-4"
            type="text"
            value={signupDetails.lname}
            onChange={(event) =>
              setSignupDetails({
                ...signupDetails,
                lname: event.target.value,
              })
            }
            required
          />
        </div>
      </div>
      <label className="form-label">Email</label>
      <input
        className="form-control mb-4"
        type="email"
        value={signupDetails.email}
        onChange={(event) =>
          setSignupDetails({ ...signupDetails, email: event.target.value })
        }
        required
      />
      <label className="form-label">Password</label>
      <input
        className="form-control mb-4"
        type="password"
        value={signupDetails.password}
        onChange={(event) =>
          setSignupDetails({
            ...signupDetails,
            password: event.target.value,
          })
        }
        required
      />
      <div className="d-flex justify-content-center">
        <button className="btn btn-secondary">
          {update ? 'Update' : 'Register'}
        </button>
      </div>
    </form>
  );
}
