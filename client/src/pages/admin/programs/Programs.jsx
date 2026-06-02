import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { programEndpoints } from '../../../api/endpoints/programEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import DynamicTable from '../../../components/tables/DynamicTable';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
        if (!res?.success) {
          toast.error(res?.message ?? 'Could not load programs', toastErrorObject);
          setPrograms([]);
          return;
        }
        setPrograms(res.data ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Could not load programs', toastErrorObject);
      } finally {
        setIsLoading(false);
      }
    }
    void loadPrograms();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this program and all of its semester structure?')) return;
    setIsLoading(true);
    try {
      const res = await fetchResponse(programEndpoints.deleteProgram(id), 3, null);
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not delete program', toastErrorObject);
        return;
      }
      setPrograms((prev) => prev.filter((program) => program._id !== id));
      toast.success(res.message ?? 'Program deleted', toastSuccessObject);
    } catch (error) {
      console.error(error);
      toast.error('Could not delete program', toastErrorObject);
    } finally {
      setIsLoading(false);
    }
  }

  const tableData = programs.map((program) => ({
    ...program,
    manage: (
      <Link className="text-blue-600 hover:underline" to={`/admin/programs/${program._id}`}>
        Manage
      </Link>
    ),
  }));

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Programs"
        subtitle="Manage academic programs, semesters, and curriculum courses."
      />

      <ContentCard
        title="Programs"
        subtitle={`${programs.length} program(s) available`}
      >
        <div className="mb-4">
          <Link to="/admin/programs/register" className="btn btn-primary">
            Create Program
          </Link>
        </div>

        <DynamicTable
          variant="instructor"
          headers={[
            'Name',
            'Description',
            'Semesters',
            'Created At',
            'Manage',
          ]}
          data={tableData}
          dataAttributes={['name', 'description', 'totalSemesters', 'createdAt', 'manage']}
        />
      </ContentCard>
    </AdminLayout>
  );
}
