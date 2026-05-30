import React from 'react';

export default function TableLayout({ children, variant }) {
  if (variant === 'instructor') {
    return <div className="inst-table-wrap">{children}</div>;
  }
  return <div className="overflow-auto">{children}</div>;
}
