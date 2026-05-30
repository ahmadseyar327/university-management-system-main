import React, { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { fetchResponse } from '../../api/service';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import SignupForm from '../../components/forms/SignupForm';

export default function StudentSettings() {
  const studentId = JSON.parse(localStorage.getItem('student'))._id;
  const { studentData, setStudentData } = useAuth();

  const [studentDetails, setStudentDetails] = useState({
    fname: studentData?.fname,
    lname: studentData?.lname,
    email: studentData?.email,
    password: studentData?.password,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        studentEndpoints.editStudent(studentId),
        2,
        studentDetails
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);

      const updatedData = {
        ...studentData,
        fname: studentDetails.fname,
        lname: studentDetails.lname,
        email: studentDetails.email,
        password: studentDetails.password,
      };
      setStudentData(updatedData);
      localStorage.setItem('student', JSON.stringify(updatedData));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="Settings"
        subtitle="Update your profile and account credentials."
      />

      <div className="max-w-lg mx-auto">
        <ContentCard title="Profile Information" subtitle="Edit your personal details">
          <SignupForm
            variant="auth"
            signupDetails={studentDetails}
            setSignupDetails={setStudentDetails}
            signup={handleUpdate}
            update={true}
          />
        </ContentCard>
      </div>
    </StudentLayout>
  );
}
