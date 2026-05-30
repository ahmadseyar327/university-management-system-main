import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { toastErrorObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import ActivityCard from '../../components/cards/ActivityCard';
import SelectField from '../../components/inputs/SelectField';
import AcademicsFilterPanel from '../../components/academics/AcademicsFilterPanel';
import FadeInPanel from '../../components/academics/FadeInPanel';
function MarkResultRow({ row, index }) {
  const obtained = row.marks ?? row.obtainedMarks;
  const total = row.totalMarks;
  const pct =
    total && obtained != null
      ? Math.min(100, Math.round((Number(obtained) / Number(total)) * 100))
      : null;

  return (
    <div className="academics-student-mark-row" style={{ animationDelay: `${index * 40}ms` }}>
      <span className="academics-student-mark-activity">#{row.activityNumber}</span>
      <div>
        <p className="academics-student-mark-meta">
          Weight {row.weightage}% · Total {total}
        </p>
        {pct != null ? (
          <div className="academics-marks-progress-track mt-1" style={{ maxWidth: 120 }}>
            <div
              className="academics-marks-progress-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : null}
      </div>
      <span className="academics-student-mark-score">
        {obtained ?? '—'}
        <span className="academics-student-mark-meta"> / {total}</span>
      </span>
    </div>
  );
}

export default function Marks() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [marksData, setMarksData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [examTypesState, setExamTypesState] = useState(null);

  useEffect(() => {
    async function fetchCourseAndExamTypeNames() {
      try {
        const res = await fetchResponse(
          studentEndpoints.getCourseAndExamTypeNames(studentId),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          return;
        }
        setCourses(res.data?.courses);
        setExamTypes(res.data?.examTypes);
        setExamTypesState(
          res.data.examTypes?.reduce((acc, examType) => {
            acc[examType] = false;
            return acc;
          }, {})
        );
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(true);
    fetchCourseAndExamTypeNames();
  }, [studentId]);

  async function handleFetchAcademics(examType) {
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        studentEndpoints.getAcademics(studentId, selectedCourse, examType),
        0,
        null
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        return;
      }
      const sortedMarksData = res.data?.sort(
        (a, b) => a.activityNumber - b.activityNumber
      );
      setMarksData((prevMarksData) => ({
        ...prevMarksData,
        [examType]: sortedMarksData,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const selectedCourseLabel = courses?.find((c) => c.courseId === selectedCourse);

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Marks"
        subtitle="View grades by course and exam component."
      />

      <FadeInPanel>
        <AcademicsFilterPanel
          step="1"
          title="Select course"
          subtitle="Choose a registered course to load results"
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
              setSelectedCourse(event.target.value);
              setMarksData([]);
              setExamTypesState((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((key) => {
                  next[key] = false;
                });
                return next;
              });
            }}
          />
          {selectedCourseLabel ? (
            <div className="academics-session-banner mt-3">
              <span>📚</span>
              <span>
                Viewing <strong>{selectedCourseLabel.title}</strong>
              </span>
            </div>
          ) : null}
        </AcademicsFilterPanel>
      </FadeInPanel>

      <FadeInPanel delay={60}>
        <ContentCard
          title="Exam results"
          subtitle="Expand an exam type to see each activity"
          className="mt-4"
        >
          {examTypes?.length ? (
            examTypes.map((examType, index) => (
              <ActivityCard
                key={index}
                variant="instructor"
                header={examType}
                isExpanded={examTypesState?.[examType]}
                handleExpanded={() => {
                  if (!examTypesState[examType]) {
                    if (!selectedCourse) {
                      toast.warning('Please select a course.', toastErrorObject);
                      return;
                    }
                    handleFetchAcademics(examType);
                  }
                  setExamTypesState({
                    ...examTypesState,
                    [examType]: !examTypesState[examType],
                  });
                }}
              >
                {(marksData?.[examType] ?? []).length ? (
                  marksData[examType].map((row, i) => (
                    <MarkResultRow key={i} row={row} index={i} />
                  ))
                ) : (
                  <p className="academics-empty-state py-4">No marks posted yet.</p>
                )}
              </ActivityCard>
            ))
          ) : (
            <p className="inst-table-empty text-center py-6">No exam types available.</p>
          )}
        </ContentCard>
      </FadeInPanel>
    </StudentLayout>
  );
}
