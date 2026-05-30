import React, { useEffect, useState } from 'react';
import AttendanceTable from '../../../components/tables/AttendanceTable';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';
import PrimaryButton from '../../../components/instructor/PrimaryButton';

export default function MarkAttendance({ data, date, courseId, instructorId }) {
  const [attendanceData, setAttendanceData] = useState(data);

  useEffect(() => {
    setAttendanceData(data?.filter((student) => student?.courseId === courseId));
  }, [data, courseId]);

  async function postAttendance() {
    if (!courseId) {
      toast.error('Please select a course.', toastErrorObject);
      return;
    }
    try {
      const res = await fetchResponse(instructorEndpoints.postAttendance(), 1, {
        date,
        attendance: attendanceData?.map((attendance) => ({
          studentId: attendance._id,
          status: attendance.status,
          isPublic: attendance.isPublic,
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
    }
  }

  if (!courseId) {
    return (
      <p className="inst-table-empty text-center py-8 text-gray-400">
        Select a course to mark attendance.
      </p>
    );
  }

  return (
    <>
      <PrimaryButton onClick={postAttendance} className="w-full mb-4">
        Post Attendance
      </PrimaryButton>
      <AttendanceTable
        variant="instructor"
        headers={['Roll Number', 'Name', 'Status']}
        data={attendanceData}
        setData={setAttendanceData}
        dataAttributes={['rollNumber', 'name', 'status']}
      />
    </>
  );
}
