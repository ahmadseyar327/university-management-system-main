import React, { useEffect, useState } from 'react';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import AttendanceEntryGrid from '../../../components/academics/AttendanceEntryGrid';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function UpdateAttendance({ data, attendanceWhole }) {
  const [attendanceData, setAttendanceData] = useState(data);

  useEffect(() => {
    setAttendanceData(data);
  }, [data]);

  async function updateAttendance() {
    try {
      const res = await fetchResponse(
        instructorEndpoints.editAttendance(attendanceWhole._id),
        2,
        { ...attendanceWhole, attendance: attendanceData }
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        return;
      }
      toast.success(res.message, toastSuccessObject);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <FadeInPanel>
      <PrimaryButton onClick={updateAttendance} className="w-full mb-4">
        Save attendance
      </PrimaryButton>
      <AttendanceEntryGrid
        rows={attendanceData}
        setRows={setAttendanceData}
        studentIdKey="studentId"
      />
    </FadeInPanel>
  );
}
