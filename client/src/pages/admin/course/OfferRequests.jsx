import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import SelectField from '../../../components/inputs/SelectField';
import { fetchResponse } from '../../../api/service';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { programEndpoints } from '../../../api/endpoints/programEndpoints';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';

function initials(fname, lname) {
  return `${fname?.[0] || ''}${lname?.[0] || ''}`.toUpperCase() || '?';
}

export default function OfferRequests() {
  const adminId = JSON.parse(localStorage.getItem('admin'))?._id;
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterCourses, setSemesterCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [offers, setOffers] = useState([]);
  const [programId, setProgramId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState('1');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadOffers() {
    const res = await fetchResponse(courseEndpoints.getCourseAssignments(), 0, null);
    setOffers(res?.success && res.data ? res.data : []);
  }

  async function loadBase() {
    const [instructorRes, programRes] = await Promise.all([
      fetchResponse(instructorEndpoints.getInstructors(), 0, null),
      fetchResponse(programEndpoints.getPrograms(), 0, null),
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

    if (programRes?.success) {
      const list = programRes.data || [];
      setPrograms(list);
      if (list.length && !programId) setProgramId(list[0]._id);
    } else {
      setPrograms([]);
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadBase();
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!programId) {
      setSemesters([]);
      return;
    }
    (async () => {
      const res = await fetchResponse(programEndpoints.getProgramById(programId), 0, null);
      if (res?.success) {
        const sems = res.data?.semesters ?? [];
        setSemesters(sems);
        if (sems.length) setSemesterNumber(String(sems[0].semesterNumber));
      } else {
        setSemesters([]);
      }
    })();
  }, [programId]);

  useEffect(() => {
    if (!programId || !semesterNumber) {
      setSemesterCourses([]);
      return;
    }
    (async () => {
      const res = await fetchResponse(
        programEndpoints.getSemesterCourses(programId, semesterNumber),
        0,
        null
      );
      if (res?.success) {
        setSemesterCourses(res.data?.courses ?? []);
      } else {
        setSemesterCourses([]);
      }
      setSelectedCourseId('');
    })();
  }, [programId, semesterNumber]);

  const assignedCourseIds = useMemo(
    () => new Set(offers.filter((o) => o.status === 'approved').map((o) => o.courseId)),
    [offers]
  );

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
    () =>
      semesterCourses.filter(
        (c) => !assignedCourseIds.has(c._id) && !takenCourseIds.has(c._id)
      ),
    [semesterCourses, assignedCourseIds, takenCourseIds]
  );

  const pendingOffers = useMemo(() => offers.filter((o) => o.status === 'pending'), [offers]);
  const activeOffers = useMemo(() => offers.filter((o) => o.status === 'approved'), [offers]);

  const selectedInstructor = instructors.find((i) => i._id === selectedInstructorId);
  const semesterOptions = semesters.map((s) => ({
    value: String(s.semesterNumber),
    title: `Semester ${s.semesterNumber} — ${s.title}`,
  }));

  function pickInstructor(id) {
    setSelectedInstructorId(id);
    setSelectedCourseId('');
  }

  async function sendOffer() {
    if (!selectedInstructorId || !selectedCourseId) {
      toast.error('Select an instructor and a semester course.', toastErrorObject);
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
    const res = await fetchResponse(courseEndpoints.deleteCourseAssignment(row._id), 3, null);
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
        title="Offer Semester Courses"
        subtitle="Assign program semester courses to instructors. They must accept before teaching."
      />

      <ContentCard title="Program & semester" subtitle="Pick where the course lives in the curriculum." className="mb-4">
        <div className="inst-filter-grid">
          <SelectField
            variant="instructor"
            label="Program"
            options={programs.map((p) => ({ value: p._id, title: p.name }))}
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          />
          <SelectField
            variant="instructor"
            label="Semester"
            options={semesterOptions}
            value={semesterNumber}
            onChange={(e) => setSemesterNumber(e.target.value)}
          />
        </div>
      </ContentCard>

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
          <p className="offer-panel-title">Step 2 — Semester course</p>
          {!selectedInstructorId ? (
            <p className="offer-empty-hint">Select an instructor first.</p>
          ) : !semesterCourses.length ? (
            <p className="offer-empty-hint">
              No courses in this semester yet. Add courses under Programs → manage semester.
            </p>
          ) : availableCourses.length ? (
            <>
              <p className="inst-card-subtitle mb-3">
                Offering to{' '}
                <strong>
                  {selectedInstructor?.fname} {selectedInstructor?.lname}
                </strong>
                {' · Semester '}
                {semesterNumber}
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
              All semester courses are assigned or already offered to this instructor.
            </p>
          )}
        </div>
      </div>

      <div className="offer-status-grid">
        <ContentCard title="Awaiting approval" subtitle={`${pendingOffers.length} pending`}>
          {pendingOffers.length ? (
            <div className="offer-row-list">
              {pendingOffers.map((row) => (
                <div key={row._id} className="offer-row-item">
                  <div className="offer-row-main">
                    <p className="offer-row-title">{row.courseTitle}</p>
                    <p className="offer-row-sub">
                      {row.instructorName} · {row.courseCode}
                      {row.programName ? ` · ${row.programName} Sem ${row.semesterNumber}` : ''}
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

        <ContentCard title="Active assignments" subtitle={`${activeOffers.length} approved`}>
          {activeOffers.length ? (
            <div className="offer-row-list">
              {activeOffers.map((row) => (
                <div key={row._id} className="offer-row-item">
                  <div className="offer-row-main">
                    <p className="offer-row-title">{row.courseTitle}</p>
                    <p className="offer-row-sub">
                      {row.instructorName} · {row.courseCode}
                      {row.programName ? ` · ${row.programName} Sem ${row.semesterNumber}` : ''}
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
