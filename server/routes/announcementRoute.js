const express = require('express');
const {
  createAnnouncement,
  getAnnouncementsByCourse,
  getAnnouncementsForStudent,
  deleteAnnouncement,
} = require('../controllers/announcementController');

const router = express.Router();

router.post('/create', createAnnouncement);
router.get('/course/:courseId', getAnnouncementsByCourse);
router.get('/student/:studentId', getAnnouncementsForStudent);
router.delete('/delete/:id', deleteAnnouncement);

module.exports = router;
