import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { useAuth } from '../../contexts/authContext';
import { fetchResponse } from '../../api/service';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';

export default function Student() {
  const { studentData } = useAuth();
  const studentId = studentData?._id;
  const [dashboard, setDashboard] = useState(null);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    async function load() {
      const res = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
      if (res?.success) setDashboard(res.data);
    }
    void load();
  }, [studentId]);

  const quickLinks = [
    { label: 'My Courses', path: '/student/courses' },
    ...(!dashboard ? [{ label: 'Enroll in Program', path: '/student/enroll' }] : []),
    { label: 'View Attendance', path: '/student/attendance' },
    { label: 'View Marks', path: '/student/marks' },
  ];

  async function confirmPromotion() {
    if (!window.confirm('Confirm promotion to the next semester?')) return;
    setPromoting(true);
    try {
      const res = await fetchResponse(academicEndpoints.studentConfirmPromotion(), 1, { studentId });
      if (!res?.success) {
        toast.error(res?.message ?? 'Promotion failed', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Promoted', toastSuccessObject);
      const dash = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
      if (dash?.success) setDashboard(dash.data);
    } finally {
      setPromoting(false);
    }
  }

  const showPromotion =
    dashboard?.status === 'Ready For Registration' &&
    dashboard?.registrationOpen &&
    dashboard?.promotionStatus === 'PASSED SEMESTER';

  return (
    <StudentLayout>
      <PageHeader
        title={`Welcome, ${studentData?.fname}`}
        subtitle="Your semester dashboard and academic records."
      />

      {dashboard ? (
        <ContentCard
          title={`${dashboard.program?.name ?? 'Program'} · Semester ${dashboard.currentSemester}`}
          subtitle={`${dashboard.semesterTitle ?? ''} · Status: ${dashboard.status}`}
          className="mb-4"
        >
          <p className="text-sm text-slate-600 mb-2">
            Semester result: {dashboard.promotionStatus ?? 'PENDING'} · Courses: {dashboard.courses?.length ?? 0}
          </p>
          {showPromotion ? (
            <PrimaryButton onClick={() => void confirmPromotion()} disabled={promoting}>
              {promoting ? 'Promoting…' : 'Confirm promotion to next semester'}
            </PrimaryButton>
          ) : null}
        </ContentCard>
      ) : (
        <ContentCard title="Get started" subtitle="Enroll in a program to begin semester 1." className="mb-4">
          <Link to="/student/enroll" className="btn btn-primary">
            Enroll in program
          </Link>
        </ContentCard>
      )}

      <div className="inst-stat-grid">
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Student</p>
            <p className="inst-stat-value">
              {studentData?.fname} {studentData?.lname}
            </p>
          </div>
        </div>
        <div className="inst-stat-card">
          <div className="inst-stat-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <div>
            <p className="inst-stat-label">Roll Number</p>
            <p className="inst-stat-value">{studentData?.rollNumber}</p>
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
            <p className="inst-stat-value">{studentData?.email}</p>
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
              {moment(studentData?.createdAt).format('MMMM D, YYYY')}
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
    </StudentLayout>
  );
}
