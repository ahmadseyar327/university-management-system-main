import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../utility/toasts';
import SelectField from '../../components/inputs/SelectField';
import AcademicsFilterPanel from '../../components/academics/AcademicsFilterPanel';
import FadeInPanel from '../../components/academics/FadeInPanel';
import { AttendanceStatusBadge } from '../../components/academics/AttendanceStatusPills';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return String(d).slice(0, 10);
  }
}

export default function Attendance() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSemesterCourses() {
      try {
        const res = await fetchResponse(
          academicEndpoints.getStudentDashboard(studentId),
          0,
          null
        );
        if (!res.success) {
          if (!String(res.message ?? '').toLowerCase().includes('not enrolled')) {
            toast.error(res.message, toastErrorObject);
          }
          setCourses([]);
          return;
        }
        setCourses(
          (res.data?.courses ?? []).map((course) => ({
            courseId: course.id,
            title: course.name,
            instructor: '—',
          }))
        );
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(true);
    fetchSemesterCourses();
  }, [studentId]);

  async function handleFetchAttendances(courseId) {
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        studentEndpoints.getAttendances(studentId, courseId),
        0,
        null
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setAttendanceSummary(null);
        return;
      }
      const sortedAttendances = res.data?.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setAttendanceData(sortedAttendances);
      setAttendanceSummary(res.summary ?? null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCourseLabel = courses?.find((c) => c.courseId === selectedCourse);

  const summary = attendanceData.reduce(
    (acc, row) => {
      const s = String(row.attendance || '').toUpperCase();
      if (s.startsWith('P')) acc.p += 1;
      else if (s.startsWith('A')) acc.a += 1;
      else if (s.startsWith('L')) acc.l += 1;
      return acc;
    },
    { p: 0, a: 0, l: 0 }
  );

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Attendance"
        subtitle="Track your presence for each class session."
      />

      <FadeInPanel>
        <AcademicsFilterPanel
          step="1"
          title="Select course"
          subtitle="Load your attendance history"
        >
          <SelectField
            variant="instructor"
            label="Course | Instructor"
            options={courses?.map((course) => ({
              title: course.title + ' | ' + course.instructor,
              value: course.courseId,
            }))}
            value={selectedCourse}
            onChange={(event) => {
              setAttendanceData([]);
              setAttendanceSummary(null);
              setSelectedCourse(event.target.value);
              handleFetchAttendances(event.target.value);
            }}
          />
        </AcademicsFilterPanel>
      </FadeInPanel>

      {selectedCourse && attendanceSummary ? (
        <FadeInPanel delay={20}>
          <ContentCard
            title="Attendance summary"
            subtitle={`${attendanceSummary.totalSessions ?? 0} of ${attendanceSummary.maxSessions ?? 16} sessions recorded`}
            className="mb-4"
          >
            <p className="text-sm text-slate-600 mb-2">
              Absences: {attendanceSummary.absences ?? 0} / {attendanceSummary.maxAbsences ?? 6} allowed
              {attendanceSummary.isRepeat ? ' · Repeat course' : ''}
            </p>
            {attendanceSummary.attendanceFailed ? (
              <p className="text-sm font-semibold text-red-600">
                More than 6 absences — this course will be marked failed and must be repeated.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                More than 6 absences in a semester fails the course.
              </p>
            )}
          </ContentCard>
        </FadeInPanel>
      ) : null}

      {selectedCourse && attendanceData.length > 0 ? (
        <FadeInPanel delay={40}>
          <div className="academics-toolbar mb-4">
            <div className="academics-toolbar-stats">
              <span className="academics-stat academics-stat-p">Present {summary.p}</span>
              <span className="academics-stat academics-stat-a">Absent {summary.a}</span>
              <span className="academics-stat academics-stat-l">Late {summary.l}</span>
            </div>
            <span className="inst-card-subtitle m-0">{attendanceData.length} sessions</span>
          </div>
        </FadeInPanel>
      ) : null}

      <FadeInPanel delay={80}>
        <ContentCard
          title="Session history"
          subtitle={
            selectedCourseLabel
              ? selectedCourseLabel.title
              : 'Choose a course above'
          }
          className="mt-4"
        >
          {!selectedCourse ? (
            <p className="academics-empty-state">Select a course to view attendance.</p>
          ) : attendanceData.length ? (
            attendanceData.map((row, index) => (
              <div
                key={index}
                className="academics-student-att-row"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div>
                  <p className="offer-row-title">{formatDate(row.date)}</p>
                  <p className="offer-row-sub">{selectedCourseLabel?.instructor}</p>
                </div>
                <AttendanceStatusBadge status={row.attendance} />
              </div>
            ))
          ) : (
            <p className="academics-empty-state">No attendance records for this course yet.</p>
          )}
        </ContentCard>
      </FadeInPanel>
    </StudentLayout>
  );
}
