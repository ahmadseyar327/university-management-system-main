import React from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';

export default function RegisterCourse() {
  return (
    <StudentLayout>
      <PageHeader
        title="Semester Registration"
        subtitle="Course enrollment is handled automatically through program enrollment."
      />

      <ContentCard
        title="Semester Enrollment"
        subtitle="Courses are assigned as part of your enrolled program."
      >
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            The old student course registration flow is no longer used. If you are not yet enrolled in a program,
            please use the Enroll Program page to begin your first semester.
          </p>
          <p>
            Once enrolled, your semester courses will be assigned automatically and appear on the My Courses page.
          </p>
          <p>
            <Link className="text-blue-600 hover:underline" to="/student/enroll/program">
              Go to Enroll Program
            </Link>
          </p>
        </div>
      </ContentCard>
    </StudentLayout>
  );
}

