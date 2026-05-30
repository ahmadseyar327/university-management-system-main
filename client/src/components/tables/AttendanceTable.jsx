import React from 'react';
import SelectField from '../inputs/SelectField';
import TableLayout from './TableLayout';

export default function AttendanceTable({
  styles,
  headers,
  data,
  setData,
  dataAttributes,
  variant,
}) {
  function handleChangeIsPublic(item) {
    setData((prevData) =>
      prevData.map((x) =>
        x.studentId === item.studentId ? { ...x, isPublic: !item.isPublic } : x
      )
    );
  }

  const tableClass =
    variant === 'instructor'
      ? 'inst-table'
      : 'table table-sm ' + (styles || '');

  const theadClass =
    variant === 'instructor' ? '' : 'bg-light text-secondary';

  return (
    <TableLayout variant={variant}>
      <table className={tableClass}>
        <thead className={theadClass}>
          <tr>
            {headers?.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.length ? (
            data.map((item, index) => (
              <tr key={index}>
                {dataAttributes.map((attribute, attrIndex) => (
                  <td
                    onClick={
                      attribute === 'name'
                        ? () => handleChangeIsPublic(item)
                        : null
                    }
                    className={`${attribute === 'name' && !item?.isPublic ? 'text-decoration-line-through' : ''} ${attribute === 'name' ? 'cursor-pointer' : ''}`}
                    key={attrIndex}
                    title={
                      attribute === 'name'
                        ? 'Click to toggle visibility'
                        : undefined
                    }
                  >
                    {attribute === 'status' ? (
                      <SelectField
                        variant={variant}
                        options={[
                          { title: 'Present (P)', value: 'P' },
                          { title: 'Absent (A)', value: 'A' },
                          { title: 'Leave (L)', value: 'L' },
                          { title: 'N/A', value: 'N/A' },
                        ]}
                        value={item[attribute]}
                        onChange={(event) => {
                          setData((prevData) =>
                            prevData.map((x) =>
                              x.studentId === item.studentId
                                ? { ...x, status: event.target.value }
                                : x
                            )
                          );
                        }}
                        required={true}
                      />
                    ) : (
                      item[attribute]
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className={variant === 'instructor' ? 'inst-table-empty' : 'text-center'}
                colSpan={headers?.length}
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {variant === 'instructor' ? (
        <p className="inst-hint px-4 pb-3">
          Click a student name to toggle attendance visibility.
        </p>
      ) : null}
    </TableLayout>
  );
}
