import React from 'react';

export default function AcademicsFilterPanel({ title, subtitle, children, step }) {
  return (
    <div className="academics-filter-panel">
      <div className="academics-filter-head">
        {step ? <span className="academics-step-badge">{step}</span> : null}
        <div>
          <h3 className="academics-filter-title">{title}</h3>
          {subtitle ? <p className="academics-filter-sub">{subtitle}</p> : null}
        </div>
      </div>
      <div className="academics-filter-body">{children}</div>
    </div>
  );
}
