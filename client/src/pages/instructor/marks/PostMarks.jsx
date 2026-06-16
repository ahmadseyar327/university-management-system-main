import React, { useEffect, useMemo, useState } from 'react';
import InstructorLayout from '../../../layouts/InstructorLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { academicEndpoints } from '../../../api/endpoints/academicEndpoints';
import SelectField from '../../../components/inputs/SelectField';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import AcademicsFilterPanel from '../../../components/academics/AcademicsFilterPanel';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function PostMarks() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const [students, setStudents] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [programId, setProgramId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetchResponse(courseEndpoints.getStudentsOfInstructor(instructorId), 0, null),
          fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
        ]);
        if (!studentsRes?.success) {
          toast.error(studentsRes?.message ?? 'Could not load students', toastErrorObject);
          setStudents([]);
        } else {
          setStudents(
            (studentsRes.data ?? []).map((s) => ({
              ...s,
              courseId: String(s.courseId ?? ''),
            }))
          );
        }
        if (coursesRes?.success) {
          setInstructorCourses(
            (coursesRes.data ?? []).filter((c) => c.status === 'approved')
          );
        } else {
          setInstructorCourses([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchData();
  }, [instructorId]);

  const courseOptions = useMemo(() => {
    return instructorCourses
      .sort((a, b) => String(a.title).localeCompare(String(b.title)))
      .map((c) => ({
        value: String(c._id ?? ''),
        title: c.semesterNumber ? `Sem ${c.semesterNumber} · ${c.title}` : c.title,
        programId: c.programId,
        semesterNumber: c.semesterNumber,
      }));
  }, [instructorCourses]);

  useEffect(() => {
    if (!courseId) {
      setRows([]);
      setProgramId('');
      setSemesterNumber('');
      return;
    }

    const selected = courseOptions.find((c) => c.value === courseId);
    const prog = selected?.programId ?? '';
    const sem = selected?.semesterNumber ?? '';
    setProgramId(String(prog));
    setSemesterNumber(String(sem ?? ''));

    async function loadMarks() {
      const courseStudents = students
        .filter((s) => String(s.courseId) === courseId)
        .map((s) => ({
          studentId: s._id,
          rollNumber: s.rollNumber,
          name: `${s.fname} ${s.lname}`,
          midExamMarks: 0,
          finalExamMarks: 0,
        }));

      if (!prog || !sem) {
        setRows(courseStudents);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetchResponse(
          academicEndpoints.getCourseResultsForInstructor(instructorId, courseId, sem),
          0,
          null
        );
        if (res?.success && res.data?.length) {
          setRows(res.data);
        } else {
          setRows(courseStudents);
        }
      } finally {
        setIsLoading(false);
      }
    }
    void loadMarks();
  }, [courseId, instructorId, students, courseOptions]);

  async function saveAll() {
    if (!courseId || !programId || !semesterNumber) {
      toast.error('Select a valid semester course.', toastErrorObject);
      return;
    }
    setSaving(true);
    try {
      for (const row of rows) {
        const res = await fetchResponse(academicEndpoints.saveCourseResult(), 1, {
          studentId: row.studentId,
          courseId,
          instructorId,
          programId,
          semesterNumber: Number(semesterNumber),
          midExamMarks: Number(row.midExamMarks) || 0,
          finalExamMarks: Number(row.finalExamMarks) || 0,
        });
        if (!res?.success) {
          toast.error(res?.message ?? 'Could not save marks', toastErrorObject);
          return;
        }
      }
      toast.success('Marks saved for all students.', toastSuccessObject);
    } finally {
      setSaving(false);
    }
  }

  function updateRow(index, field, value) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Semester Marks"
        subtitle="Enter mid exam (max 20) and final exam (max 80) marks per student."
      />

      <div className="academics-layout-split">
        <FadeInPanel>
          <AcademicsFilterPanel step="1" title="Course" subtitle="Select a semester course to grade">
            <SelectField
              variant="instructor"
              label="Course"
              options={courseOptions}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
            {semesterNumber ? (
              <div className="academics-session-banner mt-3">
                Semester {semesterNumber} · Pass threshold 55/100
              </div>
            ) : null}
          </AcademicsFilterPanel>
        </FadeInPanel>

        <FadeInPanel delay={80}>
          <ContentCard
            title="Student marks"
            subtitle={rows.length ? `${rows.length} students` : 'Select a course'}
          >
            {!courseId ? (
              <p className="academics-empty-state">Choose a course to load students.</p>
            ) : (
              <>
                {rows.map((row, index) => (
                  <div key={row.studentId} className="academics-student-mark-row">
                    <span className="academics-student-mark-activity">{row.rollNumber}</span>
                    <div>
                      <p className="academics-student-mark-meta">{row.name}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        className="academics-mark-input"
                        type="number"
                        min={0}
                        max={20}
                        placeholder="Mid"
                        value={row.midExamMarks ?? ''}
                        onChange={(e) => updateRow(index, 'midExamMarks', e.target.value)}
                      />
                      <input
                        className="academics-mark-input"
                        type="number"
                        min={0}
                        max={80}
                        placeholder="Final"
                        value={row.finalExamMarks ?? ''}
                        onChange={(e) => updateRow(index, 'finalExamMarks', e.target.value)}
                      />
                      <span className="academics-student-mark-score">
                        {(Number(row.midExamMarks) || 0) + (Number(row.finalExamMarks) || 0)}/100
                      </span>
                    </div>
                  </div>
                ))}
                <PrimaryButton className="w-full mt-4" onClick={() => void saveAll()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save marks'}
                </PrimaryButton>
              </>
            )}
          </ContentCard>
        </FadeInPanel>
      </div>
    </InstructorLayout>
  );
}
