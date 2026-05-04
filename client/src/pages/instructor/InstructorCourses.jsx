import React, { useEffect, useMemo, useState } from "react";
import { fetchResponse } from "../../api/service";
import { courseEndpoints } from "../../api/endpoints/courseEndpoints";
import { toast } from "react-toastify";
import { toastErrorObject, toastSuccessObject } from "../../utility/toasts";
import InstructorLayout from "../../layouts/InstructorLayout";

export default function InstructorCourses() {
  const instructorId = JSON.parse(localStorage.getItem("instructor"))._id;

  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const [offeredRes, catalogRes] = await Promise.all([
      fetchResponse(courseEndpoints.getCoursesOfInstructor(instructorId), 0, null),
      fetchResponse(courseEndpoints.getCourses(), 0, null),
    ]);

    if (!offeredRes?.success) {
      toast.error(offeredRes?.message || "Could not load your courses", toastErrorObject);
      setCourses([]);
    } else {
      const d = offeredRes.data || [];
      setCourses([...d].sort((a, b) => a.title.localeCompare(b.title)));
    }

    if (!catalogRes?.success) {
      toast.error(catalogRes?.message || "Could not load catalog", toastErrorObject);
      setAllCourses([]);
    } else {
      const d = catalogRes.data || [];
      setAllCourses([...d].sort((a, b) => a.title.localeCompare(b.title)));
    }
  }

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    })();
  }, [instructorId]);

  const statusMap = useMemo(() => {
    const map = new Map();
    for (const c of courses) {
      map.set(c._id, c.status || "approved");
    }
    return map;
  }, [courses]);

  async function requestOffer(item) {
    const status = statusMap.get(item._id);
    if (status === "approved") {
      toast.success("Already assigned to you.", toastSuccessObject);
      return;
    }
    if (status === "pending") {
      toast.success("Request is already pending admin approval.", toastSuccessObject);
      return;
    }

    const result = window.confirm("Send offer request to admin?");
    if (!result) return;

    setIsLoading(true);
    const res = await fetchResponse(courseEndpoints.offerCourse(), 1, {
      instructorId,
      courseId: item._id,
    });
    setIsLoading(false);

    if (!res?.success) {
      toast.error(res?.message || "Could not send request", toastErrorObject);
      return;
    }

    toast.success(res.message || "Request sent to admin", toastSuccessObject);
    await load();
  }

  return (
    <InstructorLayout isLoading={isLoading}>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Courses catalog</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
              <thead className="table-light text-secondary">
                <tr>
                  <th>Title</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Credit Hours</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allCourses.length ? (
                  allCourses.map((item) => {
                    const status = statusMap.get(item._id);
                    return (
                      <tr key={item._id}>
                        <td>{item.title}</td>
                        <td>{item.code}</td>
                        <td>{item.type}</td>
                        <td>{item.creditHours}</td>
                        <td>{item.fee}</td>
                        <td>
                          {status === "approved"
                            ? "Approved"
                            : status === "pending"
                            ? "Pending"
                            : "Not requested"}
                        </td>
                        <td>
                          {status === "approved" ? (
                            <span className="badge bg-success">Assigned</span>
                          ) : status === "pending" ? (
                            <span className="badge bg-warning text-dark">Pending</span>
                          ) : (
                            <button
                              onClick={() => void requestOffer(item)}
                              className="btn btn-sm btn-secondary"
                            >
                              Request Offer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="text-center" colSpan={7}>
                      No record found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}
