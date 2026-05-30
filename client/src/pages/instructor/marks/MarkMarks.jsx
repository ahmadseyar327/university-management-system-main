import React from 'react';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import MarksEntryGrid from '../../../components/academics/MarksEntryGrid';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function MarkMarks({
  data,
  setData,
  courseId,
  instructorId,
  setIsLoading,
  examType,
  activityNumber,
  weightage,
  totalMarks,
}) {
  const ready =
    courseId && examType && activityNumber && totalMarks && weightage;

  function setFilteredData(updater) {
    setData((prevAll) => {
      const current = prevAll.filter((s) => s.courseId === courseId);
      const next =
        typeof updater === 'function' ? updater(current) : updater;
      return prevAll.map((s) => {
        const updated = next.find(
          (n) => (n._id || n.studentId) === (s._id || s.studentId)
        );
        return updated || s;
      });
    });
  }

  async function postMarks() {
    if (!ready) {
      toast.error('Complete exam details on the left first.', toastErrorObject);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchResponse(instructorEndpoints.postAcademics(), 1, {
        examType,
        totalMarks: parseFloat(totalMarks),
        activityNumber,
        weightage,
        marks: data?.map((marks) => ({
          studentId: marks._id,
          obtainedMarks: parseFloat(marks.obtainedMarks),
          isPublic: marks.isPublic,
        })),
        instructorId,
        courseId,
      });
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        return;
      }
      toast.success(res.message, toastSuccessObject);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!courseId) {
    return (
      <p className="academics-empty-state">Choose a course to load students.</p>
    );
  }

  if (!ready) {
    return (
      <p className="academics-empty-state">
        Fill exam type, activity number, total marks, and weightage to enable grading.
      </p>
    );
  }

  return (
    <FadeInPanel>
      <PrimaryButton onClick={postMarks} className="w-full mb-4">
        Publish marks
      </PrimaryButton>
      <MarksEntryGrid
        rows={data}
        setRows={setFilteredData}
        totalMarks={totalMarks}
        studentIdKey="_id"
      />
    </FadeInPanel>
  );
}
