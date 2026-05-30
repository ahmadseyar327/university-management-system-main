import React from 'react';

export default function ActivityCard({
  header,
  children,
  isExpanded,
  handleExpanded,
  variant,
}) {
  if (variant === 'instructor') {
    return (
      <div className="inst-activity-card">
        <div className="inst-activity-header" onClick={handleExpanded}>
          <span>{header}</span>
          <span>{isExpanded ? '−' : '+'}</span>
        </div>
        {isExpanded ? <div className="inst-activity-body">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className="card shadow shadow-sm rounded" style={{ pointerEvents: 'auto' }}>
      <div
        className="card-header text-center rounded cursor-pointer"
        onClick={handleExpanded}
      >
        {header}
      </div>
      {isExpanded ? <div className="card-body">{children}</div> : null}
    </div>
  );
}
