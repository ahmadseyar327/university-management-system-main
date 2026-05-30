import React, { useState } from 'react';
import LoginLayout from '../../layouts/LoginLayout';
import LoginCard from '../../components/cards/LoginCard';
import LoginForm from '../../components/forms/LoginForm';
import { fetchResponse } from '../../api/service';
import { instructorEndpoints } from '../../api/endpoints/instructorEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

export default function InstructorLogin() {
  const { setInstructorData } = useAuth();
  const navigate = useNavigate();

  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        instructorEndpoints.loginInstructor(),
        1,
        loginDetails
      );
      const data = res.data;
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);
      setInstructorData(data);
      localStorage.setItem('instructor', JSON.stringify(data));
      navigate('/instructor');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <LoginLayout isLoading={isLoading}>
      <LoginCard title="Instructor Login" subtitle="Sign in to your account">
        <LoginForm
          loginDetails={loginDetails}
          setLoginDetails={setLoginDetails}
          login={handleLogin}
          domain="instructor"
        />
      </LoginCard>
    </LoginLayout>
  );
}
