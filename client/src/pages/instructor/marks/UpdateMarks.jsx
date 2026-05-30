import React, { useEffect, useState } from 'react';
import MarksTable from '../../../components/tables/MarksTable';
import { fetchResponse } from '../../../api/service';
import { instructorEndpoints } from '../../../api/endpoints/instructorEndpoints';
import { toast } from 'react-toastify';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import InputField from '../../../components/inputs/InputField';
import PrimaryButton from '../../../components/instructor/PrimaryButton';

export default function UpdateMarks({ data, setData }) {
  const [marksData, setMarksData] = useState(data?.marks);

  useEffect(() => {
    const sortedStudents = data?.marks?.sort((a, b) => {
      const fnameComparison = a.fname.localeCompare(b.fname);
      if (fnameComparison !== 0) return fnameComparison;
      return a.lname.localeCompare(b.lname);
    });
    setMarksData(sortedStudents);
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
      <p className="inst-table-empty text-center py-8 text-gray-400">
        Select course, exam type, and activity number to load marks.
      </p>
    );
  }

  return (
    <>
      <PrimaryButton onClick={updateMarks} className="w-full mb-4">
        Update Marks
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

      <MarksTable
        variant="instructor"
        headers={['Roll Number', 'Name', 'Obtained Marks']}
        data={marksData}
        setData={setMarksData}
        dataAttributes={['rollNumber', 'name', 'obtainedMarks']}
      />
    </>
  );
}
