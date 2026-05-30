import React from 'react';
import { useAuth } from '../contexts/authContext';
import PortalShell from '../components/portal/PortalShell';
import { studentNavItems } from '../utility/portalNav';

export default function StudentLayout({ isLoading, children }) {
  const { studentData, setStudentData } = useAuth();

  return (
    <PortalShell
      isLoading={isLoading}
      roleLabel="Student Portal"
      navItems={studentNavItems}
      user={studentData}
      onLogout={() => {
        setStudentData(null);
        localStorage.removeItem('student');
      }}
    >
      <div className="inst-page">{children}</div>
    </PortalShell>
  );
}
