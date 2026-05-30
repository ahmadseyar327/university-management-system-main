import React, { useState } from 'react';
import LoginLayout from '../../layouts/LoginLayout';
import LoginCard from '../../components/cards/LoginCard';
import SignupForm from '../../components/forms/SignupForm';
import { studentEndpoints } from '../../api/endpoints/studentEndpoints';
import { fetchResponse } from '../../api/service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { toastSuccessObject, toastErrorObject } from '../../utility/toasts';

export default function StudentSignup() {
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
        studentEndpoints.registerStudent(),
        1,
        signupDetails
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);
      navigate('/student/login');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <LoginLayout isLoading={isLoading}>
      <LoginCard
        title="Student Signup"
        subtitle="Create your student account"
        backTo="/student/login"
        backLabel="Back to login"
      >
        <SignupForm
          variant="auth"
          signupDetails={signupDetails}
          setSignupDetails={setSignupDetails}
          signup={handleSignup}
        />
      </LoginCard>
    </LoginLayout>
  );
}
