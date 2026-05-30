import React, { useEffect, useState } from 'react';
import InstructorLayout from '../../../layouts/InstructorLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { fetchResponse } from '../../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../../utility/toasts';
import UpdateAttendance from './UpdateAttendance';
import SelectField from '../../../components/inputs/SelectField';
import InputField from '../../../components/inputs/InputField';
import moment from 'moment';
import MarkAttendance from './MarkAttendance';
import AcademicsFilterPanel from '../../../components/academics/AcademicsFilterPanel';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function PostAttendance() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const uniqueCourseIds = {};

  const [attendances, setAttendances] = useState([]);
  const [studentsAttendance, setStudentsAttendance] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [temporarySelection, setTemporarySelection] = useState({
    date: moment(Date.now()).format('YYYY-MM-DD'),
    course: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetchResponse(
          instructorEndpoints.getAttendances(
            instructorId,
            temporarySelection.course,
            temporarySelection.date
          ),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          return;
        }
        setAttendances(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (temporarySelection.date && temporarySelection.course) fetchData();

    async function fetchStudents() {
      try {
        const res = await fetchResponse(
          courseEndpoints.getStudentsOfInstructor(instructorId),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          return;
        }
        const sortedStudents = res.data?.sort((a, b) => {
          const fnameComparison = a.fname.localeCompare(b.fname);
          if (fnameComparison !== 0) return fnameComparison;
          return a.lname.localeCompare(b.lname);
        });
        setStudentsAttendance(
          sortedStudents.map((student) => ({
            ...student,
            studentId: student._id,
            name: student.fname + ' ' + student.lname,
            status: 'P',
            isPublic: true,
          }))
        );
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, [instructorId, temporarySelection.course, temporarySelection.date]);

  useEffect(() => {
    if (temporarySelection.date && temporarySelection.course) {
      const duplicateObject = attendances.find(
        (attendance) =>
          moment(attendance?.date).format('YYYY-MM-DD') ===
            temporarySelection.date &&
          attendance?.course._id === temporarySelection.course
      );
      setSelectedAttendance(duplicateObject);
    } else {
      setSelectedAttendance(null);
    }
  }, [attendances, temporarySelection]);

  const courseOptions = studentsAttendance
    .filter((attendance) => {
      const courseId = attendance.courseId;
      if (!uniqueCourseIds[courseId]) {
        uniqueCourseIds[courseId] = true;
        return true;
      }
      return false;
    })
    .sort((a, b) => a.courseTitle.localeCompare(b.courseTitle))
    .map((attendance) => ({
      value: attendance.courseId,
      title: attendance.courseTitle,
    }));

  const courseTitle =
    courseOptions.find((c) => c.value === temporarySelection.course)?.title || '';

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance with quick present/absent controls."
      />

      <div className="academics-layout-split">
        <FadeInPanel>
          <AcademicsFilterPanel
            step="1"
            title="Session"
            subtitle="Date and course for this class"
          >
            <div className="inst-filter-row">
              <InputField
                variant="instructor"
                label="Date"
                type="date"
                value={temporarySelection.date}
                onChange={(event) =>
                  setTemporarySelection({
                    ...temporarySelection,
                    date: event.target.value,
                  })
                }
              />
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
            </div>
          </AcademicsFilterPanel>
        </FadeInPanel>

        <FadeInPanel delay={80}>
          <ContentCard
            title={selectedAttendance ? 'Update session' : 'Mark attendance'}
            subtitle={
              selectedAttendance
                ? `Editing existing record · ${courseTitle}`
                : courseTitle
                  ? `New session · ${courseTitle}`
                  : 'Select date and course'
            }
          >
            {selectedAttendance ? (
              <UpdateAttendance
                data={selectedAttendance?.attendance?.map((attendance) => ({
                  ...attendance,
                  name: attendance.fname + ' ' + attendance.lname,
                  isPublic:
                    attendance.isPublic === undefined ? true : attendance.isPublic,
                }))}
                attendanceWhole={selectedAttendance}
              />
            ) : (
              <MarkAttendance
                data={studentsAttendance}
                date={temporarySelection.date}
                courseId={temporarySelection.course}
                instructorId={instructorId}
              />
            )}
          </ContentCard>
        </FadeInPanel>
      </div>
    </InstructorLayout>
  );
}
