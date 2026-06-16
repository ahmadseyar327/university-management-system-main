import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { useAuth } from '../../contexts/authContext';
import { fetchResponse } from '../../api/service';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { instructorEndpoints } from '../../api/endpoints/instructorEndpoints';

function displayName(user) {
  return `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim() || '—';
}

export default function Admin() {
  const { adminData } = useAuth();
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const [studentRes, instructorRes] = await Promise.all([
          fetchResponse(studentEndpoints.getStudents(), 0, null),
          fetchResponse(instructorEndpoints.getInstructors(), 0, null),
        ]);
        setStudents(studentRes?.success && studentRes.data ? studentRes.data : []);
        setInstructors(instructorRes?.success && instructorRes.data ? instructorRes.data : []);
      } finally {
        setLoadingUsers(false);
      }
    }
    void loadUsers();
  }, []);

  const allUsers = useMemo(() => {
    const studentRows = students.map((s) => ({ ...s, role: 'Student' }));
    const instructorRows = instructors.map((i) => ({ ...i, role: 'Teacher' }));
    return [...studentRows, ...instructorRows].sort((a, b) =>
      displayName(a).localeCompare(displayName(b))
    );
  }, [students, instructors]);

  const quickLinks = [
    { label: 'Programs', path: '/admin/programs' },
    { label: 'Semester Lifecycle', path: '/admin/semester' },
    { label: 'Register Instructor', path: '/admin/instructors/register' },
    { label: 'Manage Instructors', path: '/admin/instructors/action' },
    { label: 'Offer Semester Courses', path: '/admin/offers' },
  ];

  return (
    <AdminLayout isLoading={loadingUsers}>
      <PageHeader
        title={`Welcome, ${adminData?.fname}`}
        subtitle="Manage programs, semesters, instructors, students, and course offers."
      />

      <div className="inst-stat-grid">
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Students</p>
            <p className="inst-stat-value">{students.length}</p>
          </div>
        </div>
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Teachers</p>
            <p className="inst-stat-value">{instructors.length}</p>
          </div>
        </div>
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
      </div>

      <ContentCard
        title="All Users"
        subtitle={`${allUsers.length} student(s) and teacher(s) in the system`}
        className="mb-4"
      >
        {allUsers.length === 0 ? (
          <p className="text-sm text-slate-600">No users registered yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {allUsers.map((user) => {
              const id = user._id;
              const isSelected = selectedUser?._id === id && selectedUser?.role === user.role;
              return (
                <button
                  key={`${user.role}-${id}`}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50' : 'bg-white'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">{displayName(user)}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </ContentCard>

      {selectedUser ? (
        <ContentCard
          title={displayName(selectedUser)}
          subtitle={`${selectedUser.role} profile`}
          className="mb-4"
        >
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium text-slate-900">{selectedUser.role}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{selectedUser.email ?? '—'}</dd>
            </div>
            {selectedUser.role === 'Student' ? (
              <div>
                <dt className="text-slate-500">Roll number</dt>
                <dd className="font-medium text-slate-900">{selectedUser.rollNumber ?? '—'}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-medium text-slate-900">
                {selectedUser.createdAt ? moment(selectedUser.createdAt).format('MMMM D, YYYY') : '—'}
              </dd>
            </div>
          </dl>
        </ContentCard>
      ) : null}

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
