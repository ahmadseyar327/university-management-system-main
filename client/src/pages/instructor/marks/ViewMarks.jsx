import React, { useEffect, useState } from 'react';
import InstructorLayout from '../../../layouts/InstructorLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../../utility/toasts';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import SelectField from '../../../components/inputs/SelectField';
import UpdateMarks from './UpdateMarks';
import { examTypes } from '../../../utility/constants';
import InputField from '../../../components/inputs/InputField';
import AcademicsFilterPanel from '../../../components/academics/AcademicsFilterPanel';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function ViewMarks() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const uniqueCourseIds = {};

  const [academics, setAcademics] = useState(null);
  const [students, setStudents] = useState([]);
  const [temporarySelection, setTemporarySelection] = useState({
    course: '',
    examType: '',
    activityNumber: '',
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
        setStudents(res.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, [instructorId]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetchResponse(
          instructorEndpoints.getAcademics(
            instructorId,
            temporarySelection.course,
            temporarySelection.examType,
            temporarySelection.activityNumber
          ),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setAcademics(null);
          setIsLoading(false);
          return;
        }
        setAcademics(
          res.data
            ? {
                ...res.data,
                marks: res.data?.marks?.map((m) => ({
                  ...m,
                  name: m.fname + ' ' + m.lname,
                  isPublic: m.isPublic === undefined ? true : m.isPublic,
                })),
              }
            : null
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    if (
      temporarySelection.course &&
      temporarySelection.examType &&
      temporarySelection.activityNumber
    ) {
      fetchData();
    } else {
      setAcademics(null);
    }
  }, [instructorId, temporarySelection]);

  const courseOptions = students
    .filter((student) => {
      const courseId = student.courseId;
      if (!uniqueCourseIds[courseId]) {
        uniqueCourseIds[courseId] = true;
        return true;
      }
      return false;
    })
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
    .map((student) => ({
      value: student.courseId,
      title: student.courseTitle,
    }));

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="View & Update Marks"
        subtitle="Find a posted activity and edit marks in the same card layout."
      />

      <div className="academics-layout-split">
        <FadeInPanel>
          <AcademicsFilterPanel
            step="1"
            title="Find activity"
            subtitle="Course, exam type, and activity number"
          >
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
            </div>
          </AcademicsFilterPanel>
        </FadeInPanel>

        <FadeInPanel delay={80}>
          <ContentCard title="Marks" subtitle="Edit and save when finished">
            <UpdateMarks data={academics} setData={setAcademics} />
          </ContentCard>
        </FadeInPanel>
      </div>
    </InstructorLayout>
  );
}
