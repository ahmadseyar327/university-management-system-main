import React, { useState } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import SignupForm from '../../components/forms/SignupForm';
import { instructorEndpoints } from '../../api/endpoints/instructorEndpoints';
import { fetchResponse } from '../../api/service';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/authContext';

export default function InstructorSettings() {
  const instructorId = JSON.parse(localStorage.getItem('instructor'))._id;
  const { instructorData, setInstructorData } = useAuth();

  const [instructorDetails, setInstructorDetails] = useState({
    fname: instructorData?.fname,
    lname: instructorData?.lname,
    email: instructorData?.email,
    password: instructorData?.password,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        instructorEndpoints.editInstructor(instructorId),
        2,
        instructorDetails
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);

      const updatedData = {
        ...instructorData,
        fname: instructorDetails.fname,
        lname: instructorDetails.lname,
        email: instructorDetails.email,
        password: instructorDetails.password,
      };
      setInstructorData(updatedData);
      localStorage.setItem('instructor', JSON.stringify(updatedData));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <InstructorLayout isLoading={isLoading}>
      <PageHeader
        title="Settings"
        subtitle="Update your profile and account credentials."
      />

      <div className="max-w-lg mx-auto">
        <ContentCard title="Profile Information" subtitle="Edit your personal details">
          <SignupForm
            variant="auth"
            signupDetails={instructorDetails}
            setSignupDetails={setInstructorDetails}
            signup={handleUpdate}
            update={true}
          />
        </ContentCard>
      </div>
    </InstructorLayout>
  );
}
