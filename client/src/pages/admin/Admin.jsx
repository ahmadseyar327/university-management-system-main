import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { useAuth } from '../../contexts/authContext';

export default function Admin() {
  const { adminData } = useAuth();

  const quickLinks = [
    { label: 'Register Instructor', path: '/admin/instructors/register' },
    { label: 'Manage Instructors', path: '/admin/instructors/action' },
    { label: 'Register Course', path: '/admin/courses/register' },
    { label: 'Manage Courses', path: '/admin/courses/action' },
    { label: 'Offer Requests', path: '/admin/courses/offer-requests' },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title={`Welcome, ${adminData?.fname}`}
        subtitle="Manage instructors, courses, and system settings."
      />

      <div className="inst-stat-grid">
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Administrator</p>
            <p className="inst-stat-value">
              {adminData?.fname} {adminData?.lname}
            </p>
          </div>
        </div>
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Email</p>
            <p className="inst-stat-value">{adminData?.email}</p>
          </div>
        </div>
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Member Since</p>
            <p className="inst-stat-value">
              {moment(adminData?.createdAt).format('MMMM D, YYYY')}
            </p>
          </div>
        </div>
      </div>

      <ContentCard title="Quick Actions" subtitle="Common administrative tasks">
        <div className="inst-quick-links">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="inst-quick-link">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {link.label}
            </Link>
          ))}
        </div>
      </ContentCard>
    </AdminLayout>
  );
}
