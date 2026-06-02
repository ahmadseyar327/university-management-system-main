const express = require('express');
const {
  enrollInProgram,
  getStudentAcademicRecord,
  getStudentDashboard,
  saveCourseResult,
  getCourseResultsForInstructor,
  adminPublishSemester,
  adminOpenRegistration,
  adminCloseRegistration,
  confirmPromotion,
  adminListEligibleStudents,
  recalculateSemester,
  updateStudentStatus,
} = require('../controllers/academicController');

const router = express.Router();

router.post('/enroll', enrollInProgram);
router.get('/record/:studentId', getStudentAcademicRecord);
router.get('/dashboard/:studentId', getStudentDashboard);

router.post('/course-result', saveCourseResult);
router.get('/course-result/instructor', getCourseResultsForInstructor);
router.post('/semester/recalculate', recalculateSemester);

router.post('/admin/publish-semester', adminPublishSemester);
router.post('/admin/open-registration', adminOpenRegistration);
router.post('/admin/close-registration', adminCloseRegistration);
router.get('/admin/eligible-students', adminListEligibleStudents);
router.post('/admin/confirm-promotion', confirmPromotion);
router.put('/admin/student-status/:studentId', updateStudentStatus);

module.exports = router;
