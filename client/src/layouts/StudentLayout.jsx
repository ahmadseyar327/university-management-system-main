import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import PortalShell from '../components/portal/PortalShell';
import { getStudentNavItems } from '../utility/portalNav';
import { fetchResponse } from '../api/service';
import { academicEndpoints } from '../api/endpoints/academicEndpoints';

export default function StudentLayout({ isLoading, children }) {
  const { studentData, setStudentData } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const studentId = studentData?._id;
    if (!studentId) {
      setIsEnrolled(false);
      return;
    }
    async function loadEnrollment() {
      const res = await fetchResponse(academicEndpoints.getStudentRecord(studentId), 0, null);
      setIsEnrolled(Boolean(res?.success));
    }
    void loadEnrollment();
  }, [studentData?._id]);

  return (
    <PortalShell
      isLoading={isLoading}
      roleLabel="Student Portal"
      navItems={getStudentNavItems(isEnrolled)}
      user={studentData}
      onLogout={() => {
        setStudentData(null);
        localStorage.removeItem('student');
      }}
    >
      <div className="inst-page">{children}</div>
    </PortalShell>
  );
}
