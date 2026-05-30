import React from 'react';

export default function AttendanceToolbar({ onMarkAll, counts }) {
  return (
    <div className="academics-toolbar">
      <div className="academics-toolbar-stats">
        {counts ? (
          <>
            <span className="academics-stat academics-stat-p">P {counts.P || 0}</span>
            <span className="academics-stat academics-stat-a">A {counts.A || 0}</span>
            <span className="academics-stat academics-stat-l">L {counts.L || 0}</span>
          </>
        ) : null}
      </div>
      <div className="academics-toolbar-actions">
        <button type="button" className="academics-tool-btn academics-tool-p" onClick={() => onMarkAll('P')}>
          All present
        </button>
        <button type="button" className="academics-tool-btn academics-tool-a" onClick={() => onMarkAll('A')}>
          All absent
        </button>
      </div>
    </div>
  );
}
