import moment from 'moment';
import React from 'react';
import TableLayout from './TableLayout';

export default function RegisterCourseTable({
  styles,
  headers,
  data,
  dataAttributes,
  handleAction,
  variant,
}) {
  const tableClass =
    variant === 'instructor'
      ? 'inst-table inst-table-responsive'
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
                  <td key={attrIndex} data-label={headers[attrIndex]}>
                    {attribute !== 'action' ? (
                      attribute === 'createdAt' ? (
                        moment(item[attribute]).format('LL')
                      ) : (
                        item[attribute]
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(item)}
                        className={
                          variant === 'instructor'
                            ? 'inst-btn-sm'
                            : 'btn btn-sm btn-secondary'
                        }
                      >
                        Register
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className={
                  variant === 'instructor' ? 'inst-table-empty' : 'text-center'
                }
                colSpan={headers?.length}
              >
                No courses available to register.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </TableLayout>
  );
}
