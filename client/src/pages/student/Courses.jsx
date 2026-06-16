import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import DynamicTable from '../../components/tables/DynamicTable';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { Link } from 'react-router-dom';

export default function Courses() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchResponse(
          academicEndpoints.getStudentDashboard(studentId),
          0,
          null
        );
        if (!res.success) {
          if (res.message?.includes('Not enrolled')) {
            setDashboard(null);
          } else {
            toast.error(res.message, toastErrorObject);
          }
          return;
        }
        setDashboard(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchData();
  }, [studentId]);

  async function confirmPromotion() {
    if (!window.confirm('Confirm promotion to the next semester?')) return;
    setPromoting(true);
    try {
      const res = await fetchResponse(academicEndpoints.studentConfirmPromotion(), 1, { studentId });
      if (!res?.success) {
        toast.error(res?.message ?? 'Promotion failed', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Promoted successfully', toastSuccessObject);
      const dash = await fetchResponse(academicEndpoints.getStudentDashboard(studentId), 0, null);
      if (dash?.success) setDashboard(dash.data);
    } finally {
      setPromoting(false);
    }
  }

  if (!isLoading && !dashboard) {
    return (
      <StudentLayout isLoading={false}>
        <PageHeader title="My Courses" subtitle="Enroll in a program to get semester courses." />
        <ContentCard title="Not enrolled" subtitle="You need to join a program first.">
          <Link to="/student/enroll" className="btn btn-primary">
            Enroll in program
          </Link>
        </ContentCard>
      </StudentLayout>
    );
  }

  const courses = (dashboard?.courses ?? []).map((c) => ({
    title: c.name,
    code: c.code,
    description: c.description || '—',
  }));

  const showPromotion =
    dashboard?.status === 'Ready For Registration' &&
    dashboard?.registrationOpen &&
    (dashboard?.promotionStatus === 'PASSED SEMESTER' ||
      dashboard?.promotionStatus === 'COMPLETED WITH REPEATS');

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Courses"
        subtitle={`${dashboard?.program?.name ?? ''} · Semester ${dashboard?.currentSemester ?? ''}`}
      />

      <ContentCard
        title={`Semester ${dashboard?.currentSemester ?? ''} — ${dashboard?.semesterTitle ?? ''}`}
        subtitle={`Status: ${dashboard?.status ?? ''} · Result: ${dashboard?.promotionStatus ?? 'PENDING'}`}
      >
        {showPromotion ? (
          <PrimaryButton className="mb-4" onClick={() => void confirmPromotion()} disabled={promoting}>
            {promoting ? 'Promoting…' : 'Confirm promotion to next semester'}
          </PrimaryButton>
        ) : null}

        <DynamicTable
          variant="instructor"
          headers={['Title', 'Code', 'Description']}
          data={courses}
          dataAttributes={['title', 'code', 'description']}
        />
      </ContentCard>
    </StudentLayout>
  );
}
