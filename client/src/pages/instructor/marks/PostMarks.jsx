import React, { useEffect, useState } from 'react';
import InstructorLayout from '../../../layouts/InstructorLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../../utility/toasts';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import SelectField from '../../../components/inputs/SelectField';
import MarkMarks from './MarkMarks';
import InputField from '../../../components/inputs/InputField';
import { examTypes } from '../../../utility/constants';

export default function PostMarks() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const uniqueCourseIds = {};

  const [studentsMarks, setStudentsMarks] = useState([]);
  const [temporarySelection, setTemporarySelection] = useState({
    course: '',
    examType: '',
    activityNumber: '',
    totalMarks: '',
    weightage: '',
  });
  const [isLoading, setIsLoading] = useState(true);

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
          setIsLoading(false);
          return;
        }
        const sortedStudents = res.data?.sort((a, b) => {
          const fnameComparison = a.fname.localeCompare(b.fname);
          if (fnameComparison !== 0) return fnameComparison;
          return a.lname.localeCompare(b.lname);
        });
        setStudentsMarks(
          sortedStudents.map((student) => ({
            ...student,
            studentId: student._id,
            name: student.fname + ' ' + student.lname,
            obtainedMarks: 0,
            isPublic: true,
          }))
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, [instructorId]);

  const courseOptions = studentsMarks
    .filter((marks) => {
      const courseId = marks.courseId;
      if (!uniqueCourseIds[courseId]) {
        uniqueCourseIds[courseId] = true;
        return true;
      }
      return false;
    })
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
    .map((marks) => ({
      value: marks.courseId,
      title: marks.courseTitle,
    }));

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Post Marks"
        subtitle="Enter and publish student marks for an activity."
      />

      <div className="inst-layout-split">
        <ContentCard title="Exam Details" subtitle="Configure the assessment">
          <div className="inst-filter-grid">
            <SelectField
              variant="instructor"
              label="Course"
              options={courseOptions}
              value={temporarySelection.course}
              onChange={(event) =>
                setTemporarySelection({
                  ...temporarySelection,
                  course: event.target.value,
                })
              }
            />
            <SelectField
              variant="instructor"
              label="Exam Type"
              options={examTypes?.map((exam) => ({ value: exam, title: exam }))}
              value={temporarySelection.examType}
              onChange={(event) =>
                setTemporarySelection({
                  ...temporarySelection,
                  examType: event.target.value,
                })
              }
            />
            <InputField
              variant="instructor"
              label="Activity Number"
              type="number"
              value={temporarySelection.activityNumber}
              onChange={(event) =>
                setTemporarySelection({
                  ...temporarySelection,
                  activityNumber: event.target.value,
                })
              }
              required={true}
              min={1}
            />
            <InputField
              variant="instructor"
              label="Total Marks"
              type="number"
              value={temporarySelection.totalMarks}
              onChange={(event) =>
                setTemporarySelection({
                  ...temporarySelection,
                  totalMarks: event.target.value,
                })
              }
              required={true}
              min={1}
            />
            <InputField
              variant="instructor"
              label="Weightage"
              type="number"
              value={temporarySelection.weightage}
              onChange={(event) =>
                setTemporarySelection({
                  ...temporarySelection,
                  weightage: event.target.value,
                })
              }
              required={true}
              min={0}
            />
          </div>
        </ContentCard>

        <ContentCard title="Student Marks" subtitle="Enter marks for each student">
          <MarkMarks
            data={studentsMarks.filter(
              (student) => student.courseId === temporarySelection.course
            )}
            setData={setStudentsMarks}
            courseId={temporarySelection.course}
            instructorId={instructorId}
            setIsLoading={setIsLoading}
            examType={temporarySelection.examType}
            activityNumber={temporarySelection.activityNumber}
            weightage={temporarySelection.weightage}
            totalMarks={temporarySelection.totalMarks}
          />
        </ContentCard>
      </div>
    </InstructorLayout>
  );
}
