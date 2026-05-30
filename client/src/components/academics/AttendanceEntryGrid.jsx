import React, { useMemo } from 'react';
import AttendanceStatusPills, { AttendanceStatusBadge } from './AttendanceStatusPills';
import AttendanceToolbar from './AttendanceToolbar';

export default function AttendanceEntryGrid({ rows, setRows, studentIdKey = 'studentId' }) {
  const counts = useMemo(() => {
    const c = { P: 0, A: 0, L: 0, 'N/A': 0 };
    rows.forEach((r) => {
      const s = r.status || 'N/A';
      if (c[s] !== undefined) c[s] += 1;
      else c['N/A'] += 1;
    });
    return c;
  }, [rows]);

  function markAll(status) {
    setRows((prev) => prev.map((r) => ({ ...r, status })));
  }

  function setStatus(id, status) {
    setRows((prev) =>
      prev.map((r) =>
        r[studentIdKey] === id || r._id === id ? { ...r, status } : r
      )
    );
  }

  function togglePublic(row) {
    const id = row[studentIdKey] || row._id;
    setRows((prev) =>
      prev.map((r) =>
        (r[studentIdKey] === id || r._id === id)
          ? { ...r, isPublic: !r.isPublic }
          : r
      )
    );
  }

  if (!rows.length) {
    return (
      <p className="academics-empty-state">
        Select a course to load students for this session.
      </p>
    );
  }

  return (
    <div className="academics-attendance-wrap">
      <AttendanceToolbar onMarkAll={markAll} counts={counts} />
      <div className="academics-attendance-grid">
        {rows.map((row) => {
          const id = row[studentIdKey] || row._id;
          const hidden = row.isPublic === false;
          return (
            <div key={id} className={`academics-attendance-card ${hidden ? 'academics-mark-card-hidden' : ''}`}>
              <div className="academics-attendance-card-head">
                <div>
                  <button
                    type="button"
                    className="academics-mark-name academics-mark-name-btn"
                    onClick={() => togglePublic(row)}
                  >
                    {row.name}
                  </button>
                  <p className="academics-attendance-roll">Roll {row.rollNumber}</p>
                </div>
                <AttendanceStatusBadge status={row.status} />
              </div>
              <AttendanceStatusPills
                value={row.status || 'N/A'}
                onChange={(status) => setStatus(id, status)}
              />
            </div>
          );
        })}
      </div>
      <p className="inst-hint mt-3">Tap a name to toggle whether this record is visible to the student.</p>
    </div>
  );
}
