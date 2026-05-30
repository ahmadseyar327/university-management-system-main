import React, { useEffect, useState } from 'react';
import AttendanceTable from '../../../components/tables/AttendanceTable';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import PrimaryButton from '../../../components/instructor/PrimaryButton';

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
    <>
      <PrimaryButton onClick={updateAttendance} className="w-full mb-4">
        Update Attendance
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
