import React from 'react';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';
import MarksTable from '../../../components/tables/MarksTable';
import PrimaryButton from '../../../components/instructor/PrimaryButton';

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
  async function postMarks() {
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
    <>
      <PrimaryButton onClick={postMarks} className="w-full mb-4">
        Post Marks
      </PrimaryButton>
      <MarksTable
        variant="instructor"
        headers={['Roll Number', 'Name', 'Marks']}
        data={data}
        setData={setData}
        dataAttributes={['rollNumber', 'name', 'obtainedMarks']}
        totalMarks={totalMarks}
      />
    </>
  );
}
