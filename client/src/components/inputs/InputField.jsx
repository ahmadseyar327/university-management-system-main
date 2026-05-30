import React from 'react';

const instLabel = 'inst-label';
const instInput = 'inst-input';

export default function InputField({
  label,
  type,
  value,
  onChange,
  required,
  min,
  max,
  variant,
  placeholder,
}) {
  if (variant === 'instructor') {
    return (
      <div>
        {label ? <label className={instLabel}>{label}</label> : null}
        <input
          className={instInput}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
          max={max}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <>
      {label ? <label className="form-label">{label}</label> : null}
      <input
        className="form-control"
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
      />
    </>
  );
}
