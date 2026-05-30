import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../spinners/LoadingSpinner';

function isActive(pathname, path, exact) {
  if (exact) return pathname === path;
  return pathname === path || pathname.startsWith(path + '/');
}

export default function PortalShell({
  isLoading,
  children,
  roleLabel,
  navItems,
  user,
  onLogout,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  const initials =
    `${user?.fname?.[0] || ''}${user?.lname?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="portal-app min-h-screen flex bg-slate-50">
      {sidebarOpen ? (
        <button
          type="button"
          className="inst-sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside className={`inst-sidebar ${sidebarOpen ? 'inst-sidebar-open' : ''}`}>
        <div className="inst-sidebar-brand">
          <span className="inst-sidebar-logo">UMS</span>
          <span className="inst-sidebar-role">{roleLabel}</span>
        </div>

        <nav className="inst-sidebar-nav">
          {navItems.map((item) => {
            const active = isActive(pathname, item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`inst-nav-link ${active ? 'inst-nav-link-active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="inst-sidebar-footer">
          <div className="inst-user-chip">
            <div className="inst-user-avatar">{initials}</div>
            <div className="inst-user-info">
              <span className="inst-user-name">
                {user?.fname} {user?.lname}
              </span>
              <span className="inst-user-email">{user?.email}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="inst-logout-btn">
            Sign out
          </button>
        </div>
      </aside>

      <div className="inst-main flex-1 flex flex-col min-w-0">
        <header className="inst-topbar">
          <button
            type="button"
            className="inst-menu-btn lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="inst-topbar-title">University Management System</div>
        </header>

        <main className="inst-content flex-1 overflow-auto">
          {isLoading ? <LoadingSpinner /> : children}
        </main>
      </div>
    </div>
  );
}
