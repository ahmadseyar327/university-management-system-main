import React from 'react';

export default function MarksEntryGrid({ rows, setRows, totalMarks, studentIdKey = 'studentId' }) {
  const max = parseFloat(totalMarks) || 100;

  function updateRow(id, value) {
    setRows((prev) =>
      prev.map((row) =>
        row[studentIdKey] === id || row._id === id
          ? { ...row, obtainedMarks: value }
          : row
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

  const filled = rows.filter((r) => r.obtainedMarks !== '' && r.obtainedMarks != null).length;

  return (
    <div className="academics-marks-wrap">
      <div className="academics-marks-progress">
        <div className="academics-marks-progress-label">
          <span>{filled} of {rows.length} students graded</span>
          <span>Max {max}</span>
        </div>
        <div className="academics-marks-progress-track">
          <div
            className="academics-marks-progress-fill"
            style={{ width: rows.length ? `${(filled / rows.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="academics-marks-grid">
        {rows.map((row) => {
          const id = row[studentIdKey] || row._id;
          const hidden = row.isPublic === false;
          return (
            <div key={id} className={`academics-mark-card ${hidden ? 'academics-mark-card-hidden' : ''}`}>
              <div className="academics-mark-card-top">
                <span className="academics-mark-roll">{row.rollNumber}</span>
                <button
                  type="button"
                  className="academics-visibility-btn"
                  onClick={() => togglePublic(row)}
                  title={hidden ? 'Show to student' : 'Hide from student'}
                >
                  {hidden ? 'Hidden' : 'Visible'}
                </button>
              </div>
              <button
                type="button"
                className="academics-mark-name"
                onClick={() => togglePublic(row)}
              >
                {row.name}
              </button>
              <input
                type="number"
                className="academics-mark-input"
                min={0}
                max={max}
                placeholder="0"
                value={row.obtainedMarks ?? ''}
                onChange={(e) => updateRow(id, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
