const express = require('express');
const {
  registerProgram,
  getPrograms,
  getProgramById,
  editProgram,
  deleteProgram,
  updateSemester,
  addCourseToSemester,
  getSemesterCourses,
  removeCourseFromSemester,
} = require('../controllers/programController');

const router = express.Router();

router.post('/register', registerProgram);
router.get('/getAll', getPrograms);
router.get('/get/:id', getProgramById);
router.put('/edit/:id', editProgram);
router.delete('/delete/:id', deleteProgram);

router.put('/semester/edit/:id', updateSemester);
router.get('/:programId/semester/:semesterNumber/courses', getSemesterCourses);
router.post('/semester/course/add', addCourseToSemester);
router.delete('/semester/course/:courseId', removeCourseFromSemester);

module.exports = router;
