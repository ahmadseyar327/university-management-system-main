import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../utility/toasts';
import DynamicTable from '../../components/tables/DynamicTable';
import SelectField from '../../components/inputs/SelectField';

export default function Attendance() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [attendanceData, setAttendanceData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(true);
    fetchCourseAndExamTypeNames();
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
        return;
      }
      const sortedAttendances = res.data?.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setAttendanceData(sortedAttendances);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="Attendance"
        subtitle="View your attendance records by course."
      />

      <ContentCard title="Select Course">
        <div className="inst-filter-row">
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
              setSelectedCourse(event.target.value);
              handleFetchAttendances(event.target.value);
            }}
          />
        </div>
      </ContentCard>

      <ContentCard
        title="Attendance Record"
        subtitle={
          selectedCourse
            ? `${attendanceData.length} record(s)`
            : 'Select a course to view attendance'
        }
        className="mt-4"
      >
        <DynamicTable
          variant="instructor"
          headers={['Date', 'Status']}
          data={selectedCourse ? attendanceData : []}
          dataAttributes={['date', 'attendance']}
        />
      </ContentCard>
    </StudentLayout>
  );
}
