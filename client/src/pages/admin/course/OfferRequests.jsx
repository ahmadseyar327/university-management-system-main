import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import { fetchResponse } from '../../../api/service';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';

function initials(fname, lname) {
  return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase() || '?';
}

export default function OfferRequests() {
  const adminId = JSON.parse(localStorage.getItem('admin'))?._id;
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadOffers() {
    const res = await fetchResponse(courseEndpoints.getCourseAssignments(), 0, null);
    setOffers(res?.success && res.data ? res.data : []);
  }

  async function load() {
    const [instructorRes, courseRes] = await Promise.all([
      fetchResponse(instructorEndpoints.getInstructors(), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
      loadOffers(),
    ]);

    if (instructorRes?.success) {
      setInstructors(
        [...(instructorRes.data || [])].sort((a, b) =>
          `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`)
        )
      );
    } else {
      setInstructors([]);
    }

    if (courseRes?.success) {
      setCourses(
        [...(courseRes.data || [])].sort((a, b) => a.title.localeCompare(b.title))
      );
    } else {
      setCourses([]);
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, []);

  const takenCourseIds = useMemo(() => {
    if (!selectedInstructorId) return new Set();
    return new Set(
      offers
        .filter(
          (o) =>
            o.instructorId === selectedInstructorId &&
            (o.status === 'pending' || o.status === 'approved')
        )
        .map((o) => o.courseId)
    );
  }, [offers, selectedInstructorId]);

  const availableCourses = useMemo(
    () => courses.filter((c) => !takenCourseIds.has(c._id)),
    [courses, takenCourseIds]
  );

  const pendingOffers = useMemo(
    () => offers.filter((o) => o.status === 'pending'),
    [offers]
  );

  const activeOffers = useMemo(
    () => offers.filter((o) => o.status === 'approved'),
    [offers]
  );

  const selectedInstructor = instructors.find((i) => i._id === selectedInstructorId);

  function pickInstructor(id) {
    setSelectedInstructorId(id);
    setSelectedCourseId('');
  }

  async function sendOffer() {
    if (!selectedInstructorId || !selectedCourseId) {
      toast.error('Select an instructor and a course.', toastErrorObject);
      return;
    }

    setIsLoading(true);
    const res = await fetchResponse(courseEndpoints.assignCourseToInstructor(), 1, {
      adminId,
      instructorId: selectedInstructorId,
      courseId: selectedCourseId,
    });
    setIsLoading(false);

    if (!res?.success) {
      toast.error(res?.message || 'Could not send offer', toastErrorObject);
      return;
    }

    toast.success(res.message || 'Offer sent', toastSuccessObject);
    setSelectedCourseId('');
    await loadOffers();
  }

  async function cancelOffer(row) {
    if (!window.confirm(`Cancel offer for ${row.courseTitle}?`)) return;

    setIsLoading(true);
    const res = await fetchResponse(
      courseEndpoints.deleteCourseAssignment(row._id),
      3,
      null
    );
    setIsLoading(false);

    if (!res?.success) {
      toast.error(res?.message || 'Could not cancel offer', toastErrorObject);
      return;
    }

    toast.success(res.message || 'Offer removed', toastSuccessObject);
    await loadOffers();
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Offer Courses"
        subtitle="Send a course offer to an instructor. They must accept before it becomes an active assignment."
      />

      <div className="offer-workspace">
        <div className="offer-panel">
          <p className="offer-panel-title">Step 1 — Instructor</p>
          <div className="offer-instructor-list">
            {instructors.length ? (
              instructors.map((inst) => (
                <button
                  key={inst._id}
                  type="button"
                  className={`offer-instructor-btn ${
                    selectedInstructorId === inst._id ? 'offer-instructor-btn-active' : ''
                  }`}
                  onClick={() => pickInstructor(inst._id)}
                >
                  <span className="offer-instructor-avatar">
                    {initials(inst.fname, inst.lname)}
                  </span>
                  <span>
                    <span className="offer-instructor-name">
                      {inst.fname} {inst.lname}
                    </span>
                    <span className="offer-instructor-email">{inst.email}</span>
                  </span>
                </button>
              ))
            ) : (
              <p className="offer-empty-hint">No instructors registered yet.</p>
            )}
          </div>
        </div>

        <div className="offer-panel">
          <p className="offer-panel-title">Step 2 — Course</p>
          {!selectedInstructorId ? (
            <p className="offer-empty-hint">Select an instructor to see available courses.</p>
          ) : availableCourses.length ? (
            <>
              <p className="inst-card-subtitle mb-3">
                Offering to{' '}
                <strong>
                  {selectedInstructor?.fname} {selectedInstructor?.lname}
                </strong>
                {' · '}
                {availableCourses.length} course(s) available
              </p>
              <div className="offer-course-grid">
                {availableCourses.map((course) => (
                  <button
                    key={course._id}
                    type="button"
                    className={`offer-course-chip ${
                      selectedCourseId === course._id ? 'offer-course-chip-active' : ''
                    }`}
                    onClick={() => setSelectedCourseId(course._id)}
                  >
                    <span className="offer-course-chip-title">{course.title}</span>
                    <span className="offer-course-chip-code">{course.code}</span>
                  </button>
                ))}
              </div>
              <PrimaryButton
                type="button"
                disabled={!selectedCourseId || isLoading}
                onClick={() => void sendOffer()}
                className="w-full"
              >
                Send offer to instructor
              </PrimaryButton>
            </>
          ) : (
            <p className="offer-empty-hint">
              All courses are already offered or assigned to this instructor.
            </p>
          )}
        </div>
      </div>

      <div className="offer-status-grid">
        <ContentCard
          title="Awaiting approval"
          subtitle={`${pendingOffers.length} pending`}
        >
          {pendingOffers.length ? (
            <div className="offer-row-list">
              {pendingOffers.map((row) => (
                <div key={row._id} className="offer-row-item">
                  <div className="offer-row-main">
                    <p className="offer-row-title">{row.courseTitle}</p>
                    <p className="offer-row-sub">
                      {row.instructorName} · {row.courseCode}
                    </p>
                  </div>
                  <span className="inst-badge inst-badge-warning">Pending</span>
                  <button
                    type="button"
                    className="inst-btn-outline-danger"
                    onClick={() => void cancelOffer(row)}
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="inst-table-empty py-6">No pending offers.</p>
          )}
        </ContentCard>

        <ContentCard
          title="Active assignments"
          subtitle={`${activeOffers.length} approved`}
        >
          {activeOffers.length ? (
            <div className="offer-row-list">
              {activeOffers.map((row) => (
                <div key={row._id} className="offer-row-item">
                  <div className="offer-row-main">
                    <p className="offer-row-title">{row.courseTitle}</p>
                    <p className="offer-row-sub">
                      {row.instructorName} · {row.courseCode}
                    </p>
                  </div>
                  <span className="inst-badge inst-badge-success">Active</span>
                  <button
                    type="button"
                    className="inst-btn-outline-danger"
                    onClick={() => void cancelOffer(row)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="inst-table-empty py-6">No active assignments yet.</p>
          )}
        </ContentCard>
      </div>
    </AdminLayout>
  );
}
