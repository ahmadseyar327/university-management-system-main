import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import SignupForm from '../../../components/forms/SignupForm';
import { fetchResponse } from '../../../api/service';
import { toast } from 'react-toastify';
import { toastSuccessObject, toastErrorObject } from '../../../utility/toasts';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';

export default function RegisterInstructor() {
  const navigate = useNavigate();
  const [signupDetails, setSignupDetails] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        instructorEndpoints.registerInstructor(),
        1,
        signupDetails
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);
      navigate('/admin/instructors/action');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Register Instructor"
        subtitle="Create a new instructor account."
      />

      <div className="max-w-lg mx-auto">
        <ContentCard title="Instructor Details" subtitle="Fill in the registration form">
          <SignupForm
            variant="auth"
            signupDetails={signupDetails}
            setSignupDetails={setSignupDetails}
            signup={handleSignup}
            submitLabel="Register Instructor"
            showLoginLink={false}
          />
        </ContentCard>
      </div>
    </AdminLayout>
  );
}
