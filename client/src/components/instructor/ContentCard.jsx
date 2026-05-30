import React from 'react';

export default function ContentCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`inst-card ${className}`}>
      {title ? (
        <div className="inst-card-header">
          <h2 className="inst-card-title">{title}</h2>
          {subtitle ? <p className="inst-card-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}
      <div className={title ? 'inst-card-body' : 'inst-card-body-only'}>{children}</div>
    </div>
  );
}
