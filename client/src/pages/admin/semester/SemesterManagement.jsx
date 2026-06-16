import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import SelectField from '../../../components/inputs/SelectField';
import InputField from '../../../components/inputs/InputField';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import DynamicTable from '../../../components/tables/DynamicTable';
import { fetchResponse } from '../../../api/service';
import { programEndpoints } from '../../../api/endpoints/programEndpoints';
import { academicEndpoints } from '../../../api/endpoints/academicEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { useAuth } from '../../../contexts/authContext';

export default function SemesterManagement() {
  const { adminData } = useAuth();
  const adminId = adminData?._id;

  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState('1');
  const [targetSemester, setTargetSemester] = useState('2');
  const [eligible, setEligible] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetchResponse(programEndpoints.getPrograms(), 0, null);
        if (res?.success) {
          setPrograms(res.data ?? []);
          if (res.data?.length) setProgramId(res.data[0]._id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    void loadPrograms();
  }, []);

  async function loadEligible() {
    if (!programId || !semesterNumber) return;
    setBusy(true);
    try {
      const res = await fetchResponse(
        academicEndpoints.adminEligibleStudents(programId, semesterNumber),
        0,
        null
      );
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not load eligible students', toastErrorObject);
        setEligible([]);
        return;
      }
      setEligible(res.data ?? []);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (programId && semesterNumber) void loadEligible();
  }, [programId, semesterNumber]);

  async function publishSemester() {
    if (!window.confirm(`Publish results for semester ${semesterNumber}?`)) return;
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminPublishSemester(), 1, {
        adminId,
        programId,
        semesterNumber: Number(semesterNumber),
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Publish failed', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Semester published', toastSuccessObject);
      await loadEligible();
    } finally {
      setBusy(false);
    }
  }

  async function openRegistration() {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminOpenRegistration(), 1, {
        adminId,
        programId,
        targetSemester: Number(targetSemester),
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not open registration', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Registration opened', toastSuccessObject);
    } finally {
      setBusy(false);
    }
  }

  async function closeRegistration() {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminCloseRegistration(), 1, {
        programId,
        targetSemester: Number(targetSemester),
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not close registration', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Registration closed', toastSuccessObject);
    } finally {
      setBusy(false);
    }
  }

  async function promoteStudent(studentId) {
    setBusy(true);
    try {
      const res = await fetchResponse(academicEndpoints.adminConfirmPromotion(), 1, { studentId });
      if (!res?.success) {
        toast.error(res?.message ?? 'Promotion failed', toastErrorObject);
        return;
      }
      toast.success(res.message ?? 'Student promoted', toastSuccessObject);
      await loadEligible();
    } finally {
      setBusy(false);
    }
  }

  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    title: `Semester ${i + 1}`,
  }));

  const eligibleRows = eligible.map((row) => ({
    ...row,
    promote: (
      <button
        type="button"
        className="text-blue-600 hover:underline"
        onClick={() => void promoteStudent(row.studentId)}
        disabled={busy}
      >
        Promote
      </button>
    ),
  }));

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Semester Lifecycle"
        subtitle="Publish results, manage registration windows, and promote students."
      />

      <ContentCard title="Program & Semester" subtitle="Select the program and semester to manage.">
        <div className="inst-filter-grid mb-4">
          <SelectField
            variant="instructor"
            label="Program"
            options={programs.map((p) => ({ value: p._id, title: p.name }))}
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          />
          <SelectField
            variant="instructor"
            label="Current semester"
            options={semesterOptions}
            value={semesterNumber}
            onChange={(e) => setSemesterNumber(e.target.value)}
          />
        </div>
        <PrimaryButton onClick={() => void publishSemester()} disabled={busy || !programId}>
          Publish semester results
        </PrimaryButton>
      </ContentCard>

      <ContentCard title="Registration window" subtitle="Open or close promotion registration for the next semester." className="mt-4">
        <div className="inst-filter-grid mb-4">
          <InputField
            variant="instructor"
            label="Target semester (2–8)"
            type="number"
            min={2}
            max={8}
            value={targetSemester}
            onChange={(e) => setTargetSemester(e.target.value)}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <PrimaryButton onClick={() => void openRegistration()} disabled={busy || !programId}>
            Open registration
          </PrimaryButton>
          <PrimaryButton className="btn-secondary" onClick={() => void closeRegistration()} disabled={busy || !programId}>
            Close registration
          </PrimaryButton>
        </div>
      </ContentCard>

      <ContentCard title="Eligible students" subtitle="Students ready for promotion after passing the semester." className="mt-4">
        <DynamicTable
          variant="instructor"
          headers={['Roll', 'Name', 'Email', 'Status', 'Semester', 'Action']}
          data={eligibleRows}
          dataAttributes={['rollNumber', 'name', 'email', 'status', 'currentSemester', 'promote']}
        />
      </ContentCard>
    </AdminLayout>
  );
}
