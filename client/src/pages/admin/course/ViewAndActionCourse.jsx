import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { toastErrorObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';
import ActionDynamicTable from '../../../components/tables/ActionDynamicTable';

export default function ViewAndActionCourse() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchResponse(
          courseEndpoints.getCourses(),
          0,
          null
        );
        if (!res.success) {
          toast.error(res.message, toastErrorObject);
          setIsLoading(false);
          return;
        }
        setCourses(res.data?.sort((a, b) => a.title.localeCompare(b.title)));
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setIsLoading(true);
    try {
      const res = await fetchResponse(
        courseEndpoints.deleteSingleCourse(id),
        3,
        null
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        setIsLoading(false);
        return;
      }
      setCourses((prev) => prev.filter((item) => item._id !== id));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Courses"
        subtitle="View and manage all registered courses."
      />

      <ContentCard
        title="Course Catalog"
        subtitle={`${courses.length} course(s) in the system`}
      >
        <ActionDynamicTable
          variant="instructor"
          headers={[
            'Title',
            'Code',
            'Type',
            'Credit Hours',
            'Fee',
            'Registration Date',
            'Action',
          ]}
          data={courses}
          dataAttributes={[
            'title',
            'code',
            'type',
            'creditHours',
            'fee',
            'createdAt',
            'action',
          ]}
          handleAction={handleDelete}
        />
      </ContentCard>
    </AdminLayout>
  );
}
