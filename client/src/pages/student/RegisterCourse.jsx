import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { fetchResponse } from '../../api/service';
import { courseEndpoints } from '../../api/endpoints/courseEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import RegisterCourseTable from '../../components/tables/RegisterCourseTable';

export default function RegisterCourse() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOfferedCoursesData() {
      try {
        const res = await fetchResponse(
          courseEndpoints.getOfferedCourses(),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setIsLoading(false);
          return;
        }
        const sortedCourses = res.data?.sort((a, b) => {
          const titleComparison = a.title.localeCompare(b.title);
          if (titleComparison !== 0) return titleComparison;
          return a.instructorName.localeCompare(b.instructorName);
        });
        setCourses(sortedCourses);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchOfferedCoursesData();
  }, [studentId]);

  async function registerCourse(item) {
    if (!window.confirm('Are you sure you want to register for this course?')) return;
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        courseEndpoints.registerCourseByStudent(),
        1,
        { studentId, courseId: item._id, instructorId: item.instructorId }
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="Register Course"
        subtitle="Browse available courses and enroll."
      />

      <ContentCard
        title="Available Courses"
        subtitle={`${courses.length} course(s) open for registration`}
      >
        <RegisterCourseTable
          variant="instructor"
          headers={[
            'Title',
            'Code',
            'Type',
            'Credit Hours',
            'Instructor',
            'Offer Date',
            'Action',
          ]}
          data={courses}
          dataAttributes={[
            'title',
            'code',
            'type',
            'creditHours',
            'instructorName',
            'createdAt',
            'action',
          ]}
          handleAction={registerCourse}
        />
      </ContentCard>
    </StudentLayout>
  );
}
