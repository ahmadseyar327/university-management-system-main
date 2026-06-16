import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import CourseRegisterForm from '../../../components/forms/CourseRegisterForm';

export default function RegisterCourse() {
  const adminId = JSON.parse(localStorage.getItem('admin'))._id;
  const navigate = useNavigate();

  const [signupDetails, setSignupDetails] = useState({
    title: '',
    code: '',
    type: '',
    creditHours: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegisteration(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        courseEndpoints.registerCourse(),
        1,
        { ...signupDetails, adminId }
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);
      navigate('/admin/courses/action');
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Register Course"
        subtitle="Add a new course to the university catalog."
      />

      <div className="max-w-lg mx-auto">
        <ContentCard title="Course Details" subtitle="Fill in the course information">
          <CourseRegisterForm
            variant="auth"
            registrationDetails={signupDetails}
            setRegistrationDetails={setSignupDetails}
            registration={handleRegisteration}
          />
        </ContentCard>
      </div>
    </AdminLayout>
  );
}
