import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import PageHeader from '../../../components/instructor/PageHeader';
import ContentCard from '../../../components/instructor/ContentCard';
import { fetchResponse } from '../../../api/service';
import { courseEndpoints } from '../../../api/endpoints/courseEndpoints';
import { toastErrorObject, toastSuccessObject } from '../../../utility/toasts';
import { toast } from 'react-toastify';

export default function OfferRequests() {
  const adminId = JSON.parse(localStorage.getItem('admin'))?._id;
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const res = await fetchResponse(courseEndpoints.getOfferRequests(), 0, null);
    if (!res?.success) {
      setRows([]);
      return;
    }
    setRows(
      [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, []);

  async function review(row, action) {
    if (
      !window.confirm(
        `${action === 'approve' ? 'Approve' : 'Decline'} request for ${row.courseTitle}?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    const res = await fetchResponse(
      courseEndpoints.reviewOfferRequest(row._id),
      2,
      { adminId, action }
    );
    setIsLoading(false);

    if (!res?.success) {
      toast.error(res?.message || 'Could not review request', toastErrorObject);
      return;
    }
    toast.success(res.message || 'Request updated', toastSuccessObject);
    setRows((prev) => prev.filter((x) => x._id !== row._id));
  }

  return (
    <AdminLayout isLoading={isLoading}>
      <PageHeader
        title="Offer Requests"
        subtitle="Review instructor requests to teach courses."
      />

      <ContentCard
        title="Pending Requests"
        subtitle={`${rows.length} request(s) awaiting review`}
      >
        <div className="inst-table-wrap">
          <table className="inst-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Email</th>
                <th>Course</th>
                <th>Code</th>
                <th>Requested</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.instructorName}</td>
                    <td>{row.instructorEmail}</td>
                    <td>{row.courseTitle}</td>
                    <td>{row.courseCode}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="inst-action-group">
                        <button
                          type="button"
                          className="inst-btn-success"
                          onClick={() => void review(row, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="inst-btn-outline-danger"
                          onClick={() => void review(row, 'decline')}
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="inst-table-empty">
                    No pending requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ContentCard>
    </AdminLayout>
  );
}
