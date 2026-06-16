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
  const [courseId, setCourseId] = useState('');
  const [programId, setProgramId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState('');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetchResponse(
          courseEndpoints.getStudentsOfInstructor(instructorId),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setStudents([]);
          return;
        }
        setStudents(res.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchStudents();
  }, [instructorId]);

  const courseOptions = useMemo(() => {
    const seen = new Set();
    return students
      .filter((s) => {
        if (!s.courseId || seen.has(s.courseId)) return false;
        seen.add(s.courseId);
        return true;
      })
      .sort((a, b) => String(a.courseTitle).localeCompare(String(b.courseTitle)))
      .map((s) => ({ value: s.courseId, title: s.courseTitle }));
  }, [students]);

  useEffect(() => {
    if (!courseId) {
      setRows([]);
      return;
    }
    const sample = students.find((s) => s.courseId === courseId);
    const prog = sample?.programId ?? '';
    const sem = sample?.semesterNumber ?? '';
    setProgramId(prog);
    setSemesterNumber(String(sem ?? ''));

    async function loadMarks() {
      if (!prog || !sem) {
        const filtered = students
          .filter((s) => s.courseId === courseId)
          .map((s) => ({
            studentId: s._id,
            rollNumber: s.rollNumber,
            name: `${s.fname} ${s.lname}`,
            midExamMarks: 0,
            finalExamMarks: 0,
          }));
        setRows(filtered);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetchResponse(
          academicEndpoints.getCourseResultsForInstructor(instructorId, courseId, sem),
          0,
          null
        );
        if (res?.success) {
          setRows(res.data ?? []);
        } else {
          const filtered = students
            .filter((s) => s.courseId === courseId)
            .map((s) => ({
              studentId: s._id,
              rollNumber: s.rollNumber,
              name: `${s.fname} ${s.lname}`,
              midExamMarks: 0,
              finalExamMarks: 0,
            }));
          setRows(filtered);
        }
      } finally {
        setIsLoading(false);
      }
    }
    void loadMarks();
  }, [courseId, instructorId, students]);

  async function saveAll() {
    if (!courseId || !programId || !semesterNumber) {
      toast.error('Course must belong to a semester program enrollment.', toastErrorObject);
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
          <AcademicsFilterPanel step="1" title="Course" subtitle="Select a course to grade">
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
