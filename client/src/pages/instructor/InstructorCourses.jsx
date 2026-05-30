import React, { useEffect, useMemo, useState } from 'react';
import { fetchResponse } from '../../api/service';
import { courseEndpoints } from '../../api/endpoints/courseEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import InstructorLayout from '../../layouts/InstructorLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';

export default function InstructorCourses() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;

  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const [offeredRes, catalogRes] = await Promise.all([
      fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
    ]);

    if (!offeredRes?.success) {
      toast.error(offeredRes?.message || 'Could not load your courses', toastErrorObject);
      setCourses([]);
    } else {
      setCourses([...(offeredRes.data || [])].sort((a, b) => a.title.localeCompare(b.title)));
    }

    if (!catalogRes?.success) {
      toast.error(catalogRes?.message || 'Could not load catalog', toastErrorObject);
      setAllCourses([]);
    } else {
      setAllCourses([...(catalogRes.data || [])].sort((a, b) => a.title.localeCompare(b.title)));
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [instructorId]);

  const statusMap = useMemo(() => {
    const map = new Map();
    for (const c of courses) {
      map.set(c._id, c.status || 'approved');
    }
    return map;
  }, [courses]);

  async function requestOffer(item) {
    const status = statusMap.get(item._id);
    if (status === 'approved') {
      toast.success('Already assigned to you.', toastSuccessObject);
      return;
    }
    if (status === 'pending') {
      toast.success('Request is already pending admin approval.', toastSuccessObject);
      return;
    }

    if (!window.confirm('Send offer request to admin?')) return;

    setIsLoading(true);
    const res = await fetchResponse(courseEndpoints.offerCourse(), 1, {
      instructorId,
      courseId: item._id,
    });
    setIsLoading(false);

    if (!res?.success) {
      toast.error(res?.message || 'Could not send request', toastErrorObject);
      return;
    }

    toast.success(res.message || 'Request sent to admin', toastSuccessObject);
    await load();
  }

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Courses"
        subtitle="Browse the catalog and request to teach new courses."
      />

      <ContentCard title="Course Catalog" subtitle={`${allCourses.length} courses available`}>
        <div className="inst-table-wrap">
          <table className="inst-table inst-table-responsive">
            <thead>
              <tr>
                <th>Title</th>
                <th>Code</th>
                <th>Type</th>
                <th>Credit Hours</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allCourses.length ? (
                allCourses.map((item) => {
                  const status = statusMap.get(item._id);
                  return (
                    <tr key={item._id}>
                      <td data-label="Title">{item.title}</td>
                      <td data-label="Code">{item.code}</td>
                      <td data-label="Type">{item.type}</td>
                      <td data-label="Credit Hours">{item.creditHours}</td>
                      <td data-label="Fee">{item.fee}</td>
                      <td data-label="Status">
                        {status === 'approved' ? (
                          <span className="inst-badge inst-badge-success">Approved</span>
                        ) : status === 'pending' ? (
                          <span className="inst-badge inst-badge-warning">Pending</span>
                        ) : (
                          <span className="inst-badge inst-badge-neutral">Not requested</span>
                        )}
                      </td>
                      <td data-label="Action">
                        {status === 'approved' ? (
                          <span className="inst-badge inst-badge-success">Assigned</span>
                        ) : status === 'pending' ? (
                          <span className="inst-badge inst-badge-warning">Awaiting</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void requestOffer(item)}
                            className="inst-btn-sm"
                          >
                            Request Offer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="inst-table-empty">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </InstructorLayout>
  );
}
