import React from 'react';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="inst-page-header">
      <div>
        <h1 className="inst-page-title">{title}</h1>
        {subtitle ? <p className="inst-page-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="inst-page-action">{action}</div> : null}
    </div>
  );
}
