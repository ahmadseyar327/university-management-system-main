import React, { useEffect, useState } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import { courseEndpoints } from '../../api/endpoints/courseEndpoints';
import { fetchResponse } from '../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../utility/toasts';
import DynamicTable from '../../components/tables/DynamicTable';
import SelectField from '../../components/inputs/SelectField';

export default function InstructorStudents() {
  const uniqueCourseIds = {};
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;

  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
        setStudents(
          sortedStudents?.map((student) => ({
            ...student,
            name: student.fname + ' ' + student.lname,
          }))
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [instructorId]);

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

  const filteredStudents = students.filter(
    (student) => student.courseId === selectedCourse
  );

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Students"
        subtitle="View enrolled students by course."
      />

      <ContentCard title="Filter by Course">
        <div className="inst-filter-row">
          <SelectField
            variant="instructor"
            label="Select Course"
            options={courseOptions}
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
          />
        </div>
      </ContentCard>

      <ContentCard
        title="Student Roster"
        subtitle={
          selectedCourse
            ? `${filteredStudents.length} student(s) enrolled`
            : 'Select a course to view students'
        }
        className="mt-4"
      >
        <DynamicTable
          variant="instructor"
          headers={['Roll Number', 'Name', 'Email Address', 'Joining Date']}
          data={selectedCourse ? filteredStudents : []}
          dataAttributes={['rollNumber', 'name', 'email', 'createdAt']}
        />
      </ContentCard>
    </InstructorLayout>
  );
}
