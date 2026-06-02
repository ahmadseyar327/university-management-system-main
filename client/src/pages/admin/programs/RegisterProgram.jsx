import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { programEndpoints } from '../../../api/endpoints/programEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import InputField from '../../../components/inputs/InputField';
import PrimaryButton from '../../../components/ui/PrimaryButton';

export default function RegisterProgram() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  async function registerProgram(event) {
    event.preventDefault();
    if (!form.name) {
      toast.error('Program name is required.', toastErrorObject);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchResponse(programEndpoints.registerProgram(), 1, {
        name: form.name,
        description: form.description,
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not create program', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Program created', toastSuccessObject);
      navigate(`/admin/programs/${res.data.program._id}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not create program', toastErrorObject);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Create Program"
        subtitle="Define an academic program with eight semesters."
      />

      <div className="max-w-2xl mx-auto">
        <ContentCard title="Program Details" subtitle="Enter program name and description.">
          <form onSubmit={registerProgram} className="space-y-4">
            <InputField
              variant="auth"
              label="Program Name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <InputField
              variant="auth"
              label="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <PrimaryButton type="submit" className="w-full">
              Create Program
            </PrimaryButton>
          </form>
        </ContentCard>
      </div>
    </AdminLayout>
  );
}
