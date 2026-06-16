import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Instructor from "./pages/instructor/Instructor";
import Student from "./pages/student/Student";
import Admin from "./pages/admin/Admin";
import InstructorLogin from "./pages/instructor/InstructorLogin";
import StudentLogin from "./pages/student/StudentLogin";
import StudentSignup from "./pages/student/StudentSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import ViewAndActionInstructor from "./pages/admin/instructor/ViewAndActionInstructor";
import RegisterInstructor from "./pages/admin/instructor/RegisterInstructor";
import OfferRequests from "./pages/admin/course/OfferRequests";
import AdminSettings from "./pages/admin/AdminSettings";
import { useAuth } from "./contexts/authContext";
import ErrorPage from "./pages/ErrorPage";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import PostAttendance from "./pages/instructor/attendance/PostAttendance";
import PostMarks from "./pages/instructor/marks/PostMarks";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import Courses from "./pages/student/Courses";
import StudentSettings from "./pages/student/StudentSettings";
import Marks from "./pages/student/Marks";
import Attendance from "./pages/student/Attendance";
import ViewMarks from "./pages/instructor/marks/ViewMarks";
import Activator from "./Activator";
import Programs from "./pages/admin/programs/Programs";
import RegisterProgram from "./pages/admin/programs/RegisterProgram";
import ProgramDetails from "./pages/admin/programs/ProgramDetails";
import SemesterManagement from "./pages/admin/semester/SemesterManagement";
import EnrollProgram from "./pages/student/EnrollProgram";

export default function App() {
  const { studentData, instructorData, adminData } = useAuth();

  return (
    <>
      <ToastContainer />
      <Activator />
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />

          <Route
            exact
            path="/instructor"
            element={instructorData ? <Instructor /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/students"
            element={instructorData ? <InstructorStudents /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/marks/post"
            element={instructorData ? <PostMarks /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/marks/view-or-update"
            element={instructorData ? <ViewMarks /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/attendance"
            element={instructorData ? <PostAttendance /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/courses"
            element={instructorData ? <InstructorCourses /> : <InstructorLogin />}
          />
          <Route
            path="/instructor/settings"
            element={instructorData ? <InstructorSettings /> : <InstructorLogin />}
          />
          <Route path="/instructor/login" element={<InstructorLogin />} />

          <Route
            exact
            path="/student"
            element={studentData ? <Student /> : <StudentLogin />}
          />
          <Route
            path="/student/courses"
            element={studentData ? <Courses /> : <StudentLogin />}
          />
          <Route
            path="/student/register/course"
            element={<Navigate to="/student/enroll" replace />}
          />
          <Route
            path="/student/enroll"
            element={studentData ? <EnrollProgram /> : <StudentLogin />}
          />
          <Route
            path="/student/attendance"
            element={studentData ? <Attendance /> : <StudentLogin />}
          />
          <Route
            path="/student/marks"
            element={studentData ? <Marks /> : <StudentLogin />}
          />
          <Route
            path="/student/settings"
            element={studentData ? <StudentSettings /> : <StudentLogin />}
          />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
         
          <Route
            exact
            path="/admin"
            element={adminData ? <Admin /> : <AdminLogin />}
          />
          <Route
            path="/admin/instructors/action"
            element={adminData ? <ViewAndActionInstructor /> : <AdminLogin />}
          />
          <Route
            path="/admin/instructors/register"
            element={adminData ? <RegisterInstructor /> : <AdminLogin />}
          />
          <Route
            path="/admin/courses/action"
            element={<Navigate to="/admin/programs" replace />}
          />
          <Route
            path="/admin/courses/assign"
            element={<Navigate to="/admin/offers" replace />}
          />
          <Route
            path="/admin/offers"
            element={adminData ? <OfferRequests /> : <AdminLogin />}
          />
          <Route
            path="/admin/courses/offer-requests"
            element={<Navigate to="/admin/offers" replace />}
          />
          <Route
            path="/admin/courses/register"
            element={<Navigate to="/admin/programs" replace />}
          />
          <Route
            path="/admin/settings"
            element={adminData ? <AdminSettings /> : <AdminLogin />}
          />
          <Route
            path="/admin/programs"
            element={adminData ? <Programs /> : <AdminLogin />}
          />
          <Route
            path="/admin/programs/register"
            element={adminData ? <RegisterProgram /> : <AdminLogin />}
          />
          <Route
            path="/admin/programs/:id"
            element={adminData ? <ProgramDetails /> : <AdminLogin />}
          />
          <Route
            path="/admin/semester"
            element={adminData ? <SemesterManagement /> : <AdminLogin />}
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
