import React, { useEffect, useState } from 'react';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import InputField from '../../../components/inputs/InputField';
import PrimaryButton from '../../../components/instructor/PrimaryButton';
import MarksEntryGrid from '../../../components/academics/MarksEntryGrid';
import FadeInPanel from '../../../components/academics/FadeInPanel';

export default function UpdateMarks({ data, setData }) {
  const [marksData, setMarksData] = useState([]);

  useEffect(() => {
    const sorted = [...(data?.marks || [])].sort((a, b) => {
      const fn = (a.fname || '').localeCompare(b.fname || '');
      return fn !== 0 ? fn : (a.lname || '').localeCompare(b.lname || '');
    });
    setMarksData(
      sorted.map((m) => ({
        ...m,
        name: m.name || `${m.fname || ''} ${m.lname || ''}`.trim(),
        studentId: m.studentId,
      }))
    );
  }, [data?.marks]);

  async function updateMarks() {
    try {
      const res = await fetchResponse(
        instructorEndpoints.editAcademics(data._id),
        2,
        { ...data, marks: marksData }
      );
      if (!res.success) {
        toast.error(res.message, toastErrorObject);
        return;
      }
      toast.success(res.message, toastSuccessObject);
    } catch (error) {
      console.log(error);
    }
  }

  if (!data) {
    return (
      <p className="academics-empty-state">
        Select course, exam type, and activity number to load marks.
      </p>
    );
  }

  return (
    <FadeInPanel>
      <PrimaryButton onClick={updateMarks} className="w-full mb-4">
        Save changes
      </PrimaryButton>
      <div className="inst-filter-row mb-4">
        <InputField
          variant="instructor"
          label="Total Marks"
          type="number"
          value={data?.totalMarks ?? ''}
          onChange={(event) =>
            setData({ ...data, totalMarks: event.target.value })
          }
          required={true}
          min={1}
        />
        <InputField
          variant="instructor"
          label="Weightage"
          type="number"
          value={data?.weightage ?? ''}
          onChange={(event) =>
            setData({ ...data, weightage: event.target.value })
          }
          required={true}
          min={0}
        />
      </div>
      <MarksEntryGrid
        rows={marksData}
        setRows={setMarksData}
        totalMarks={data?.totalMarks}
        studentIdKey="studentId"
      />
    </FadeInPanel>
  );
}
