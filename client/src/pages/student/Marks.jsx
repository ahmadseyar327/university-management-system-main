import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import { toastErrorObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import FadeInPanel from '../../components/academics/FadeInPanel';

function failReasonLabel(reason) {
  if (reason === 'marks') return 'Failed exam';
  if (reason === 'attendance') return 'Failed attendance';
  if (reason === 'marks_and_attendance') return 'Failed exam & attendance';
  return null;
}

function ResultRow({ course }) {
  const mid = course.midExamMarks ?? '—';
  const fin = course.finalExamMarks ?? '—';
  const total = course.totalMarks ?? '—';
  const status =
    course.passFailStatus ??
    (course.markStatus === 'Unpublished' ? 'Unpublished' : 'Pending');
  const reason = failReasonLabel(course.failReason);
  const absences =
    course.absenceCount != null ? `${course.absenceCount} absence(s)` : null;

  return (
    <div className="academics-student-mark-row">
      <span className="academics-student-mark-activity">{course.code}</span>
      <div>
        <p className="academics-student-mark-meta">
          {course.name}
          {course.isRepeat ? ' · Repeat course' : ''}
        </p>
        <p className="academics-student-mark-meta">Mid {mid}/20 · Final {fin}/80</p>
        {absences ? (
          <p className="academics-student-mark-meta">{absences} (max 6 allowed)</p>
        ) : null}
        {reason ? <p className="academics-student-mark-meta text-red-600">{reason}</p> : null}
      </div>
      <span className="academics-student-mark-score">
        {total}/100 · {status}
      </span>
    </div>
  );
}

function StatusBadge({ label, ongoing }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        ongoing
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-slate-100 text-slate-700'
      }`}
    >
      {label}
    </span>
  );
}

function SemesterBlock({ semester, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-slate-50 text-left"
      >
        <div>
          <p className="font-semibold text-slate-900">
            Semester {semester.semesterNumber} · {semester.semesterTitle}
          </p>
          <p className="text-sm text-slate-500">
            {semester.courses?.length ?? 0} course(s)
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge label={semester.statusLabel} ongoing={semester.isOngoing} />
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open ? (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
          {(semester.courses ?? []).length ? (
            semester.courses.map((course) => (
              <ResultRow key={course.courseId} course={course} />
            ))
          ) : (
            <p className="academics-empty-state py-4">No courses for this semester.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function Marks() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetchResponse(
          academicEndpoints.getSemesterHistory(studentId),
          0,
          null
        );
        if (!res.success) {
          if (!res.message?.includes('No academic record')) {
            toast.error(res.message, toastErrorObject);
          }
          return;
        }
        setHistory(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchHistory();
  }, [studentId]);

  if (!isLoading && !history) {
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

  const ongoing = history?.ongoingSemester;
  const past = history?.historySemesters ?? [];

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Marks"
        subtitle={
          history?.program?.name
            ? `${history.program.name} · Semester ${history.currentSemester}`
            : 'Semester course marks'
        }
      />

      {ongoing ? (
        <FadeInPanel>
          <ContentCard
            title="Current semester"
            subtitle="Your ongoing semester and live course marks"
            className="mb-4"
          >
            <SemesterBlock semester={ongoing} defaultOpen />
          </ContentCard>
        </FadeInPanel>
      ) : null}

      <FadeInPanel>
        <ContentCard
          title="History"
          subtitle={
            past.length
              ? 'Past semesters — click a semester to view course marks'
              : 'Completed semesters will appear here'
          }
        >
          {past.length ? (
            [...past].reverse().map((semester) => (
              <SemesterBlock key={semester.semesterNumber} semester={semester} />
            ))
          ) : (
            <p className="academics-empty-state py-4">No past semesters yet.</p>
          )}
        </ContentCard>
      </FadeInPanel>
    </StudentLayout>
  );
}
