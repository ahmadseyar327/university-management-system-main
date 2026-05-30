import React from 'react';

export default function SelectField({
  label,
  options,
  value,
  onChange,
  required,
  variant,
}) {
  if (variant === 'instructor') {
    return (
      <div>
        {label ? (
          <label htmlFor={label} className="inst-label">
            {label}
          </label>
        ) : null}
        <select
          id={label}
          className="inst-select"
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="">Select an option</option>
          {options?.map((item, index) => (
            <option key={index} value={item.value}>
              {item.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <>
      {label ? (
        <label htmlFor={label} className="form-label">
          {label}
        </label>
      ) : null}
      <select
        id={label}
        className="form-select"
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Select</option>
        {options?.map((item, index) => (
          <option key={index} value={item.value}>
            {item.title}
          </option>
        ))}
      </select>
    </>
  );
}
