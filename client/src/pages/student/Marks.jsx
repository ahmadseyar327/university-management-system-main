import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { toastErrorObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import DynamicTable from '../../components/tables/DynamicTable';
import ActivityCard from '../../components/cards/ActivityCard';
import SelectField from '../../components/inputs/SelectField';

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

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="Marks"
        subtitle="View your marks and grades by course and exam type."
      />

      <ContentCard title="Select Course">
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
      </ContentCard>

      <ContentCard title="Exam Results" subtitle="Expand an exam type to view marks" className="mt-4">
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
              <DynamicTable
                variant="instructor"
                headers={[
                  'Activity Number',
                  'Weightage',
                  'Total Marks',
                  'Obtained Marks',
                ]}
                data={marksData ? marksData[examType] : []}
                dataAttributes={[
                  'activityNumber',
                  'weightage',
                  'totalMarks',
                  'marks',
                ]}
              />
            </ActivityCard>
          ))
        ) : (
          <p className="inst-table-empty text-center py-6">No exam types available.</p>
        )}
      </ContentCard>
    </StudentLayout>
  );
}
