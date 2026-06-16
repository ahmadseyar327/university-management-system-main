import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import { toastErrorObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import FadeInPanel from '../../components/academics/FadeInPanel';
import { Link } from 'react-router-dom';

function ResultRow({ course, result }) {
  const mid = result?.midExamMarks ?? '—';
  const fin = result?.finalExamMarks ?? '—';
  const total = result?.totalMarks ?? '—';
  const status = result?.passFailStatus ?? (result?.isPublished === false ? 'Unpublished' : 'Pending');

  return (
    <div className="academics-student-mark-row">
      <span className="academics-student-mark-activity">{course.code}</span>
      <div>
        <p className="academics-student-mark-meta">{course.name}</p>
        <p className="academics-student-mark-meta">Mid {mid}/20 · Final {fin}/80</p>
      </div>
      <span className="academics-student-mark-score">
        {total}/100 · {status}
      </span>
    </div>
  );
}

export default function Marks() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetchResponse(
          academicEndpoints.getStudentDashboard(studentId),
          0,
          null
        );
        if (!res.success) {
          if (!res.message?.includes('Not enrolled')) {
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
    void fetchDashboard();
  }, [studentId]);

  if (!isLoading && !dashboard) {
    return (
      <StudentLayout isLoading={false}>
        <PageHeader title="My Marks" subtitle="Semester results appear after enrollment." />
        <ContentCard title="Not enrolled">
          <Link to="/student/enroll" className="btn btn-primary">
            Enroll in program
          </Link>
        </ContentCard>
      </StudentLayout>
    );
  }

  const resultsByCourse = {};
  (dashboard?.results ?? []).forEach((r) => {
    resultsByCourse[r.courseId] = r;
  });

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Marks"
        subtitle={`Semester ${dashboard?.currentSemester ?? ''} · ${dashboard?.semesterTitle ?? ''}`}
      />

      <FadeInPanel>
        <ContentCard
          title="Course results"
          subtitle={`Semester outcome: ${dashboard?.promotionStatus ?? 'PENDING'}`}
        >
          {(dashboard?.courses ?? []).length ? (
            dashboard.courses.map((course) => (
              <ResultRow
                key={course.id}
                course={course}
                result={resultsByCourse[course.id]}
              />
            ))
          ) : (
            <p className="academics-empty-state py-4">No courses assigned for this semester.</p>
          )}
        </ContentCard>
      </FadeInPanel>
    </StudentLayout>
  );
}
