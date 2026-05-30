import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import SignupForm from '../../components/forms/SignupForm';
import { adminEndpoints } from '../../api/endpoints/adminEndpoints';
import { fetchResponse } from '../../api/service';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/authContext';

export default function AdminSettings() {
  const adminId = JSON.parse(localStorage.getItem('admin'))._id;
  const { adminData, setAdminData } = useAuth();

  const [adminDetails, setAdminDetails] = useState({
    fname: adminData?.fname,
    lname: adminData?.lname,
    email: adminData?.email,
    password: adminData?.password,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        adminEndpoints.editAdmin(adminId),
        2,
        adminDetails
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      toast.success(res.message, toastSuccessObject);

      const updatedData = {
        ...adminData,
        fname: adminDetails.fname,
        lname: adminDetails.lname,
        email: adminDetails.email,
        password: adminDetails.password,
      };
      setAdminData(updatedData);
      localStorage.setItem('admin', JSON.stringify(updatedData));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Settings"
        subtitle="Update your admin profile and credentials."
      />

      <div className="max-w-lg mx-auto">
        <ContentCard title="Profile Information" subtitle="Edit your personal details">
          <SignupForm
            variant="auth"
            signupDetails={adminDetails}
            setSignupDetails={setAdminDetails}
            signup={handleUpdate}
            update={true}
          />
        </ContentCard>
      </div>
    </AdminLayout>
  );
}
