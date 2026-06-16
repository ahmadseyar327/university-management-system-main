import React, { useEffect, useState } from 'react';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import AttendanceEntryGrid from '../../../components/academics/AttendanceEntryGrid';
import FadeInPanel from '../../../components/academics/FadeInPanel';

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
      <p className="academics-empty-state">Select a course and date to mark attendance.</p>
    );
  }

  return (
    <FadeInPanel>
      <div className="academics-session-banner">
        <span>📅</span>
        <span>
          Session <strong>{date}</strong> · {attendanceData.length} students · max 16 sessions per course
        </span>
      </div>
      <PrimaryButton onClick={postAttendance} className="w-full mb-4">
        Save attendance
      </PrimaryButton>
      <AttendanceEntryGrid rows={attendanceData} setRows={setAttendanceData} studentIdKey="_id" />
    </FadeInPanel>
  );
}
