import React, { useState } from 'react';
import LoginLayout from '../../layouts/LoginLayout';
import LoginCard from '../../components/cards/LoginCard';
import LoginForm from '../../components/forms/LoginForm';
import { fetchResponse } from '../../api/service';
import { adminEndpoints } from '../../api/endpoints/adminEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const { setAdminData } = useAuth();
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
        adminEndpoints.loginAdmin(),
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
      setAdminData(data);
      localStorage.setItem('admin', JSON.stringify(data));
      navigate('/admin');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <LoginLayout isLoading={isLoading}>
      <LoginCard title="Admin Login" subtitle="Sign in to your account">
        <LoginForm
          loginDetails={loginDetails}
          setLoginDetails={setLoginDetails}
          login={handleLogin}
          domain="admin"
        />
      </LoginCard>
    </LoginLayout>
  );
}
