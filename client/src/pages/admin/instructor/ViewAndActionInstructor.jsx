import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { fetchResponse } from '../../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject } from '../../../utility/toasts';
import ActionDynamicTable from '../../../components/tables/ActionDynamicTable';

export default function ViewAndActionInstructor() {
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchResponse(
          instructorEndpoints.getInstructors(),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setIsLoading(false);
          return;
        }
        setInstructors(
          res.data?.sort((a, b) => {
            const fnameComparison = a.fname.localeCompare(b.fname);
            if (fnameComparison !== 0) return fnameComparison;
            return a.lname.localeCompare(b.lname);
          })
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        instructorEndpoints.deleteSingleInstructor(id),
        3,
        null
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      setInstructors((prev) => prev.filter((item) => item._id !== id));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Instructors"
        subtitle="View and manage all registered instructors."
      />

      <ContentCard
        title="Instructor List"
        subtitle={`${instructors.length} instructor(s) registered`}
      >
        <ActionDynamicTable
          variant="instructor"
          headers={[
            'First Name',
            'Last Name',
            'Email Address',
            'Joining Date',
            'Action',
          ]}
          data={instructors}
          dataAttributes={['fname', 'lname', 'email', 'createdAt', 'action']}
          handleAction={handleDelete}
        />
      </ContentCard>
    </AdminLayout>
  );
}
