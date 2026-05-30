import React from 'react';
import moment from 'moment';
import TableLayout from './TableLayout';

export default function DynamicTable({
  styles,
  headers,
  data,
  dataAttributes,
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
                    {attribute === 'createdAt' || attribute === 'date'
                      ? moment(item[attribute]).format('LL')
                      : item[attribute]}
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
    </TableLayout>
  );
}
