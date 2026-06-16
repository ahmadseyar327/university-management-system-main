export const instructorNavbarContent = (setInstructorData) => ({
  options: [
    {
      title: 'Home',
      path: '/instructor',
    },
    {
      title: 'Students',
      path: '/instructor/students',
    },
    {
      title: 'Marks',
      path: '/instructor/marks/post',
    },
    {
      title: 'Attendance',
      path: '/instructor/attendance',
    },
    {
      title: 'Courses',
      path: '/instructor/courses',
    },
    {
      title: 'Settings',
      path: '/instructor/settings',
    },
  ],
  functionalItem: {
    title: 'Logout',
    function: () => {
      setInstructorData(null);
      localStorage.removeItem('instructor');
    },
  },
});

export const studentNavbarContent = (setStudentData) => ({
  options: [
    {
      title: 'Home',
      path: '/student',
    },
    {
      title: 'Courses',
      path: '/student/courses',
    },
    {
      title: 'Register Program',
      path: '/student/enroll',
    },
    {
      title: 'Attendance',
      path: '/student/attendance',
    },
    {
      title: 'Marks',
      path: '/student/marks',
    },
    {
      title: 'Settings',
      path: '/student/settings',
    },
  ],
  functionalItem: {
    title: 'Logout',
    function: () => {
      setStudentData(null);
      localStorage.removeItem('student');
    },
  },
});

export const adminNavbarContent = (setAdminData) => ({
  options: [
    {
      title: 'Home',
      path: '/admin',
    },
    {
      title: 'Programs',
      path: '/admin/programs',
    },
    {
      title: 'Semester Lifecycle',
      path: '/admin/semester',
    },
    {
      title: 'Register Instructor',
      path: '/admin/instructors/register',
    },
    {
      title: 'Instructors',
      path: '/admin/instructors/action',
    },
    {
      title: 'Offer Semester Courses',
      path: '/admin/offers',
    },
    {
      title: 'Settings',
      path: '/admin/settings',
    },
  ],
  functionalItem: {
    title: 'Logout',
    function: () => {
      setAdminData(null);
      localStorage.removeItem('admin');
    },
  },
});
