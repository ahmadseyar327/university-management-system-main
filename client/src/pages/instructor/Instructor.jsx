import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import InstructorLayout from '../../layouts/InstructorLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { useAuth } from '../../contexts/authContext';

export default function Instructor() {
  const { instructorData } = useAuth();

  const quickLinks = [
    { label: 'View Students', path: '/instructor/students' },
    { label: 'Post Marks', path: '/instructor/marks/post' },
    { label: 'Take Attendance', path: '/instructor/attendance' },
    { label: 'Browse Courses', path: '/instructor/courses' },
  ];

  return (
    <InstructorLayout>
      <PageHeader
        title={`Welcome, ${instructorData?.fname}`}
        subtitle="Manage your courses, students, marks, and attendance from one place."
      />

      <div className="inst-stat-grid">
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Instructor</p>
            <p className="inst-stat-value">
              {instructorData?.fname} {instructorData?.lname}
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
            <p className="inst-stat-value">{instructorData?.email}</p>
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
              {moment(instructorData?.createdAt).format('MMMM D, YYYY')}
            </p>
          </div>
        </div>
      </div>

      <ContentCard title="Quick Actions" subtitle="Jump to common tasks">
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
    </InstructorLayout>
  );
}
