import React from 'react';
import { inputClass, labelClass, submitButtonClass } from './authFormStyles';
import SelectField from '../inputs/SelectField';

export default function CourseRegisterForm({
  registrationDetails,
  setRegistrationDetails,
  registration,
  variant,
}) {
  if (variant === 'auth') {
    return (
      <form onSubmit={(event) => registration(event)} className="space-y-4">
        <div className="auth-field">
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            type="text"
            placeholder="Course title"
            value={registrationDetails.title}
            onChange={(event) =>
              setRegistrationDetails({
                ...registrationDetails,
                title: event.target.value,
              })
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="auth-field">
            <label className={labelClass}>Credit Hours</label>
            <input
              className={inputClass}
              type="number"
              value={registrationDetails.creditHours}
              onChange={(event) =>
                setRegistrationDetails({
                  ...registrationDetails,
                  creditHours: event.target.value,
                })
              }
              required
            />
          </div>
          <div className="auth-field">
            <label className={labelClass}>Fee</label>
            <input
              className={inputClass}
              type="number"
              value={registrationDetails.fee}
              onChange={(event) =>
                setRegistrationDetails({
                  ...registrationDetails,
                  fee: event.target.value,
                })
              }
              required
            />
          </div>
        </div>
        <div className="auth-field">
          <SelectField
            variant="instructor"
            label="Type"
            options={[
              { title: 'Core', value: 'Core' },
              { title: 'Elective', value: 'Elective' },
            ]}
            value={registrationDetails.type}
            onChange={(event) =>
              setRegistrationDetails({
                ...registrationDetails,
                type: event.target.value,
              })
            }
            required
          />
        </div>
        <div className="auth-field">
          <label className={labelClass}>Code</label>
          <input
            className={inputClass}
            type="text"
            placeholder="e.g. CS101"
            value={registrationDetails.code}
            onChange={(event) =>
              setRegistrationDetails({
                ...registrationDetails,
                code: event.target.value,
              })
            }
            required
          />
        </div>
        <button type="submit" className={submitButtonClass}>
          Register Course
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => registration(event)}>
      <label className="form-label">Title</label>
      <input
        className="form-control mb-4"
        type="text"
        value={registrationDetails.title}
        onChange={(event) =>
          setRegistrationDetails({
            ...registrationDetails,
            title: event.target.value,
          })
        }
        required
      />
      <label className="form-label">Credit Hours</label>
      <input
        className="form-control mb-4"
        type="number"
        value={registrationDetails.creditHours}
        onChange={(event) =>
          setRegistrationDetails({
            ...registrationDetails,
            creditHours: event.target.value,
          })
        }
        required
      />
      <label className="form-label">Fee</label>
      <input
        className="form-control mb-4"
        type="number"
        value={registrationDetails.fee}
        onChange={(event) =>
          setRegistrationDetails({
            ...registrationDetails,
            fee: event.target.value,
          })
        }
        required
      />
      <label className="form-label">Type</label>
      <select
        className="form-select mb-4"
        value={registrationDetails.type}
        onChange={(event) =>
          setRegistrationDetails({
            ...registrationDetails,
            type: event.target.value,
          })
        }
        required
      >
        <option value="">Select</option>
        <option value="Core">Core</option>
        <option value="Elective">Elective</option>
      </select>
      <label className="form-label">Code</label>
      <input
        className="form-control mb-4"
        type="text"
        value={registrationDetails.code}
        onChange={(event) =>
          setRegistrationDetails({
            ...registrationDetails,
            code: event.target.value,
          })
        }
        required
      />
      <div className="d-flex justify-content-center">
        <button className="btn btn-secondary">Register</button>
      </div>
    </form>
  );
}
