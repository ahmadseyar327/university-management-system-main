import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { programEndpoints } from '../../../api/endpoints/programEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import InputField from '../../../components/inputs/InputField';
import SelectField from '../../../components/inputs/SelectField';
import PrimaryButton from '../../../components/ui/PrimaryButton';
import { useAuth } from '../../../contexts/authContext';
import DynamicTable from '../../../components/tables/DynamicTable';

export default function ProgramDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adminData } = useAuth();
  const [program, setProgram] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingProgram, setSavingProgram] = useState(false);
  const [savingSemester, setSavingSemester] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '', code: '', type: 'Core', fee: '', creditHours: '', description: '',
  });

  useEffect(() => {
    async function loadProgram() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetchResponse(programEndpoints.getProgramById(id), 0, null);
        if (!res?.success) {
          toast.error(res?.message ?? 'Could not load program details', toastErrorObject);
          return;
        }
        setProgram(res.data.program);
        setSemesters(res.data.semesters ?? []);
        if (!selectedSemesterId && res.data.semesters?.length) {
          setSelectedSemesterId(res.data.semesters[0]._id);
        }
      } catch (error) {
        console.error(error);
        toast.error('Could not load program details', toastErrorObject);
      } finally {
        setIsLoading(false);
      }
    }
    void loadProgram();
  }, [id]);

  useEffect(() => {
    async function loadCourses() {
      if (!program || !selectedSemesterId) {
        setCourses([]);
        return;
      }
      try {
        const semester = semesters.find((s) => s._id === selectedSemesterId);
        if (!semester) {
          setCourses([]);
          return;
        }
        const res = await fetchResponse(
          programEndpoints.getSemesterCourses(program._id, semester.semesterNumber),
          0,
          null
        );
        if (!res?.success) {
          toast.error(res?.message ?? 'Could not load semester courses', toastErrorObject);
          setCourses([]);
          return;
        }
        setCourses(res.data.courses ?? []);
      } catch (error) {
        console.error(error);
        toast.error('Could not load semester courses', toastErrorObject);
      }
    }
    void loadCourses();
  }, [program, selectedSemesterId, semesters]);

  async function saveProgram() {
    if (!program?.name) {
      toast.error('Program name is required.', toastErrorObject);
      return;
    }
    setSavingProgram(true);
    try {
      const res = await fetchResponse(programEndpoints.editProgram(program._id), 2, {
        name: program.name,
        description: program.description,
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not update program', toastErrorObject);
        return;
      }
      setProgram(res.data);
      toast.success(res.message ?? 'Program updated', toastSuccessObject);
    } catch (error) {
      console.error(error);
      toast.error('Could not update program', toastErrorObject);
    } finally {
      setSavingProgram(false);
    }
  }

  async function saveSemesterDescription(semesterId, description) {
    setSavingSemester(true);
    try {
      const res = await fetchResponse(programEndpoints.updateSemester(semesterId), 2, { description });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not update semester', toastErrorObject);
        return;
      }
      setSemesters((prev) => prev.map((semester) => (semester._id === semesterId ? res.data : semester)));
      toast.success(res.message ?? 'Semester updated', toastSuccessObject);
    } catch (error) {
      console.error(error);
      toast.error('Could not update semester', toastErrorObject);
    } finally {
      setSavingSemester(false);
    }
  }

  async function addCourse() {
    if (!selectedSemesterId || !courseForm.title || !courseForm.code) {
      toast.error('Course title and code are required.', toastErrorObject);
      return;
    }
    if (!courseForm.fee || !courseForm.creditHours) {
      toast.error('Fee and credit hours are required.', toastErrorObject);
      return;
    }
    const adminId = adminData?._id || program?.adminId;
    if (!adminId) {
      toast.error('Admin session missing. Please log in again.', toastErrorObject);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchResponse(programEndpoints.addCourseToSemester(), 1, {
        semesterId: selectedSemesterId,
        title: courseForm.title,
        code: courseForm.code,
        description: courseForm.description,
        fee: Number(courseForm.fee),
        creditHours: Number(courseForm.creditHours),
        type: courseForm.type,
        adminId,
      });
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not add course', toastErrorObject);
        return;
      }
      setCourseForm({ title: '', code: '', type: 'Core', fee: '', creditHours: '', description: '' });
      toast.success(res.message ?? 'Course added', toastSuccessObject);
      void fetchResponse(programEndpoints.getSemesterCourses(program._id, semesters.find((s) => s._id === selectedSemesterId)?.semesterNumber), 0, null)
        .then((semesterRes) => {
          if (semesterRes?.success) setCourses(semesterRes.data.courses ?? []);
        });
    } catch (error) {
      console.error(error);
      toast.error('Could not add course', toastErrorObject);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeCourse(courseId) {
    if (!window.confirm('Remove this course from the semester?')) return;
    setIsLoading(true);
    try {
      const res = await fetchResponse(programEndpoints.removeCourseFromSemester(courseId), 3, null);
      if (!res?.success) {
        toast.error(res?.message ?? 'Could not remove course', toastErrorObject);
        return;
      }
      setCourses((prev) => prev.filter((course) => course._id !== courseId));
      toast.success(res.message ?? 'Course removed', toastSuccessObject);
    } catch (error) {
      console.error(error);
      toast.error('Could not remove course', toastErrorObject);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <AdminLayout isLoading={true} />;
  }

  return (
    <AdminLayout>
      <PageHeader
        title={program?.name || 'Program details'}
        subtitle="View and manage semester structure and courses."
      />

      <ContentCard title="Program Overview" subtitle="Edit program information.">
        <div className="space-y-4">
          <InputField
            variant="auth"
            label="Program Name"
            value={program?.name ?? ''}
            onChange={(event) => setProgram((prev) => ({ ...prev, name: event.target.value }))}
          />
          <InputField
            variant="auth"
            label="Description"
            value={program?.description ?? ''}
            onChange={(event) => setProgram((prev) => ({ ...prev, description: event.target.value }))}
          />
          <PrimaryButton onClick={() => void saveProgram()} disabled={savingProgram}>
            {savingProgram ? 'Saving…' : 'Save program'}
          </PrimaryButton>
          <PrimaryButton className="btn-secondary" onClick={() => navigate('/admin/programs')}>
            Back to programs
          </PrimaryButton>
        </div>
      </ContentCard>

      <ContentCard title="Semester Structure" subtitle="Select a semester to inspect its courses.">
        <div className="space-y-4">
          <SelectField
            variant="auth"
            label="Choose semester"
            options={semesters.map((semester) => ({
              value: semester._id,
              title: `Semester ${semester.semesterNumber} — ${semester.title}`,
            }))}
            value={selectedSemesterId}
            onChange={(event) => setSelectedSemesterId(event.target.value)}
          />

          {semesters
            .filter((semester) => semester._id === selectedSemesterId)
            .map((semester) => (
              <div key={semester._id} className="space-y-2">
                <InputField
                  variant="auth"
                  label="Semester title"
                  value={semester.title}
                  onChange={(event) =>
                    setSemesters((prev) =>
                      prev.map((item) =>
                        item._id === semester._id
                          ? { ...item, title: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <InputField
                  variant="auth"
                  label="Semester description"
                  value={semester.description}
                  onChange={(event) =>
                    setSemesters((prev) =>
                      prev.map((item) =>
                        item._id === semester._id
                          ? { ...item, description: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <PrimaryButton onClick={() => void saveSemesterDescription(semester._id, semester.description)} disabled={savingSemester}>
                  {savingSemester ? 'Saving…' : 'Update semester'}
                </PrimaryButton>
              </div>
            ))}
        </div>
      </ContentCard>

      <ContentCard title="Semester Courses" subtitle="Add or remove courses for the selected semester.">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              variant="auth"
              label="Course title"
              value={courseForm.title}
              onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
              required
            />
            <InputField
              variant="auth"
              label="Course code"
              value={courseForm.code}
              onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <InputField
              variant="auth"
              label="Credit hours"
              type="number"
              value={courseForm.creditHours}
              onChange={(event) => setCourseForm({ ...courseForm, creditHours: event.target.value })}
            />
            <InputField
              variant="auth"
              label="Fee"
              type="number"
              value={courseForm.fee}
              onChange={(event) => setCourseForm({ ...courseForm, fee: event.target.value })}
              required
            />
            <InputField
              variant="auth"
              label="Type"
              value={courseForm.type}
              onChange={(event) => setCourseForm({ ...courseForm, type: event.target.value })}
            />
          </div>
          <InputField
            variant="auth"
            label="Description"
            value={courseForm.description}
            onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })}
          />
          <PrimaryButton onClick={() => void addCourse()}>
            Add course to semester
          </PrimaryButton>

          <DynamicTable
            variant="instructor"
            headers={['Title', 'Code', 'Type', 'Credit Hours', 'Fee', 'Action']}
            data={courses.map((course) => ({
              ...course,
              action: (
                <button
                  type="button"
                  className="inst-btn-danger"
                  onClick={() => void removeCourse(course._id)}
                >
                  Remove
                </button>
              ),
            }))}
            dataAttributes={['title', 'code', 'type', 'creditHours', 'fee', 'action']}
          />
        </div>
      </ContentCard>
    </AdminLayout>
  );
}
