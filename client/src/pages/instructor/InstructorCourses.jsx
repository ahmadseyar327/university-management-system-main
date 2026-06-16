import React, { useEffect, useMemo, useState } from 'react';
import { fetchResponse } from '../../api/service';
import { courseEndpoints } from '../../api/endpoints/courseEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import InstructorLayout from '../../layouts/InstructorLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import DynamicTable from '../../components/tables/DynamicTable';

export default function InstructorCourses() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  async function load() {
    const res = await fetchResponse(
      courseEndpoints.getCoursesOfInstructor(instructorId),
      0,
      null
    );

    if (!res?.success) {
      toast.error(res?.message || 'Could not load courses', toastErrorObject);
      setCourses([]);
    } else {
      setCourses(res.data || []);
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [instructorId]);

  const pendingOffers = useMemo(
    () => courses.filter((c) => c.status === 'pending'),
    [courses]
  );

  const activeCourses = useMemo(
    () =>
      [...courses.filter((c) => c.status === 'approved')].sort((a, b) =>
        a.title.localeCompare(b.title)
      ),
    [courses]
  );

  async function reviewOffer(offerId, action) {
    setBusyId(offerId);
    const res = await fetchResponse(
      courseEndpoints.instructorReviewOffer(offerId),
      2,
      { instructorId, action }
    );
    setBusyId('');

    if (!res?.success) {
      toast.error(res?.message || 'Could not update offer', toastErrorObject);
      return;
    }

    toast.success(res.message || 'Offer updated', toastSuccessObject);
    await load();
  }

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="My Courses"
        subtitle="Review course offers from the administrator and manage your active assignments."
      />

      {pendingOffers.length > 0 ? (
        <ContentCard
          title="Course offers"
          subtitle={`${pendingOffers.length} awaiting your response`}
          className="mb-4"
        >
          <div className="offer-row-list">
            {pendingOffers.map((course) => (
              <div key={course.requestId} className="offer-pending-card">
                <div className="offer-row-main">
                  <p className="offer-row-title">{course.title}</p>
                  <p className="offer-row-sub">
                    {course.code} · {course.type} · Sem {course.semesterNumber ?? '—'}
                    {course.programName ? ` · ${course.programName}` : ''}
                  </p>
                </div>
                <div className="offer-pending-actions">
                  <button
                    type="button"
                    className="inst-btn-outline-danger"
                    disabled={busyId === course.requestId}
                    onClick={() => void reviewOffer(course.requestId, 'decline')}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    className="inst-btn-success"
                    disabled={busyId === course.requestId}
                    onClick={() => void reviewOffer(course.requestId, 'approve')}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      ) : null}

      <ContentCard
        title="Active courses"
        subtitle={`${activeCourses.length} course(s) you are teaching`}
      >
        <DynamicTable
          variant="instructor"
          headers={['Title', 'Code', 'Program', 'Semester', 'Type']}
          data={activeCourses}
          dataAttributes={['title', 'code', 'programName', 'semesterNumber', 'type']}
        />
      </ContentCard>
    </InstructorLayout>
  );
}
