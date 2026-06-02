import React, { useEffect, useState } from 'react';
import { fetchResponse } from '../../api/service';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../utility/toasts';
import StudentLayout from '../../layouts/StudentLayout';
import PageHeader from '../../components/instructor/PageHeader';
import ContentCard from '../../components/instructor/ContentCard';
import SelectField from '../../components/inputs/SelectField';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { academicEndpoints } from '../../api/endpoints/academicEndpoints';
import { programEndpoints } from '../../api/endpoints/programEndpoints';

export default function EnrollProgram() { 

  const student = JSON.parse(localStorage.getItem('student'));
  const studentId = student?._id;

  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      try {
        setIsLoading(true);
        const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
        if (!res?.success) {
          toast.error(res?.message ?? 'Could not load programs', toastErrorObject);
          return;
        }
        setPrograms(res.data ?? []);
        if (res.data?.length) setProgramId(res.data[0]._id);
      } catch (e) {
        toast.error('Could not load programs', toastErrorObject);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrograms();
  }, []);

  async function enroll() {
    if (!studentId || !programId) return;
    if (!window.confirm('Enroll in this program?')) return;

    try {
      setSubmitting(true);
      const res = await fetchResponse(academicEndpoints.enrollInProgram(), 1, {
        studentId,
        programId,
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Enrollment failed', toastErrorObject);
        return;
      }
      toast.success(res?.message ?? 'Enrollment successful', toastSuccessObject);
      // Go to dashboard
      window.location.href = '/student';
    } catch (e) {
      toast.error('Enrollment failed', toastErrorObject);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StudentLayout isLoading={isLoading}>
      <PageHeader
        title="Enroll in Program"
        subtitle="Semester 1 is assigned automatically after enrollment."
      />

      <ContentCard
        title="Select Program"
        subtitle={programs.length ? 'Choose your program to start' : 'No programs available'}
      >
        <div className="space-y-4">
          <SelectField
            variant="auth"
            label="Program"
            options={programs.map((p) => ({ value: p._id, title: p.name }))}
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          />

          <PrimaryButton
            onClick={() => void enroll()}
            className="w-full"
            disabled={!programId || submitting}
          >
            {submitting ? 'Enrolling...' : 'Enroll'}
          </PrimaryButton>
        </div>
      </ContentCard>
    </StudentLayout>
  );
}

