import React from 'react';
import { useAuth } from '../contexts/authContext';
import PortalShell from '../components/portal/PortalShell';
import { adminNavItems } from '../utility/portalNav';

export default function AdminLayout({ isLoading, children }) {
  const { adminData, setAdminData } = useAuth();

  return (
    <PortalShell
      isLoading={isLoading}
      roleLabel="Admin Portal"
      navItems={adminNavItems}
      user={adminData}
      onLogout={() => {
        setAdminData(null);
        localStorage.removeItem('admin');
      }}
    >
      <div className="inst-page">{children}</div>
    </PortalShell>
  );
}
