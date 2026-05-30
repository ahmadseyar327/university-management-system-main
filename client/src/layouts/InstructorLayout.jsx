import React from 'react';
import { useAuth } from '../contexts/authContext';
import PortalShell from '../components/portal/PortalShell';
import { instructorNavItems } from '../utility/portalNav';

export default function InstructorLayout({ isLoading, children }) {
  const { instructorData, setInstructorData } = useAuth();

  return (
    <PortalShell
      isLoading={isLoading}
      roleLabel="Instructor Portal"
      navItems={instructorNavItems}
      user={instructorData}
      onLogout={() => {
        setInstructorData(null);
        localStorage.removeItem('instructor');
      }}
    >
      <div className="inst-page">{children}</div>
    </PortalShell>
  );
}
