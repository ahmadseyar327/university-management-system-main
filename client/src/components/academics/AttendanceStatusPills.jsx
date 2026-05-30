import React from 'react';

const OPTIONS = [
  { value: 'P', label: 'Present', short: 'P', className: 'academics-status-p' },
  { value: 'A', label: 'Absent', short: 'A', className: 'academics-status-a' },
  { value: 'L', label: 'Late', short: 'L', className: 'academics-status-l' },
  { value: 'N/A', label: 'N/A', short: '—', className: 'academics-status-na' },
];

export function AttendanceStatusBadge({ status }) {
  const opt =
    OPTIONS.find((o) => o.value === status) ||
    OPTIONS.find((o) => o.value === 'N/A');
  return (
    <span className={`academics-status-badge ${opt.className}`}>{opt.short}</span>
  );
}

export default function AttendanceStatusPills({ value, onChange }) {
  return (
    <div className="academics-status-pills" role="group" aria-label="Attendance status">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`academics-status-pill ${opt.className} ${
            value === opt.value ? 'academics-status-pill-active' : ''
          }`}
          onClick={() => onChange(opt.value)}
          title={opt.label}
        >
          {opt.short}
        </button>
      ))}
    </div>
  );
}
