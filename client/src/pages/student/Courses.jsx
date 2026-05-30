import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { courseEndpoints } from '../../api/endpoints/courseEndpoints';
import { toastErrorObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import DynamicTable from '../../components/tables/DynamicTable';

export default function Courses() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchResponse(
          courseEndpoints.getCoursesOfStudent(studentId),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setIsLoading(false);
          return;
        }
        setCourses(res.data?.sort((a, b) => a.title.localeCompare(b.title)));
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="My Courses"
        subtitle="Courses you are currently enrolled in."
      />

      <ContentCard
        title="Enrolled Courses"
        subtitle={`${courses.length} course(s) registered`}
      >
        <DynamicTable
          variant="instructor"
          headers={[
            'Title',
            'Code',
            'Type',
            'Credit Hours',
            'Fee',
            'Instructor',
            'Registration Date',
          ]}
          data={courses}
          dataAttributes={[
            'title',
            'code',
            'type',
            'creditHours',
            'fee',
            'instructorName',
            'createdAt',
          ]}
        />
      </ContentCard>
    </StudentLayout>
  );
}
