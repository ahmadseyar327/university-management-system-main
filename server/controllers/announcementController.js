const announcementSchema = require('../models/announcementModel');
const registeredCourseSchema = require('../models/registeredCourseModel');

const createAnnouncement = async (req, res) => {
  try {
    const { courseId, instructorId, title, description } = req.body;
    if (!courseId || !instructorId || !title) {
      return res.status(400).send({ success: false, message: 'courseId, instructorId, and title are required.' });
    }
    const announcement = await announcementSchema.create({
      courseId,
      instructorId,
      title: title.trim(),
      description: description || '',
    });
    res.status(201).send({ success: true, message: 'Announcement posted.', data: announcement });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not create announcement.', error });
  }
};

const getAnnouncementsByCourse = async (req, res) => {
  try {
    const announcements = await announcementSchema
      .find({ courseId: req.params.courseId })
      .sort({ createdAt: -1 });
    res.status(200).send({ success: true, data: announcements });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch announcements.', error });
  }
};

const getAnnouncementsForStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const enrollments = await registeredCourseSchema.find({ studentId });
    const courseIds = enrollments.map((e) => e.courseId);
    const announcements = await announcementSchema
      .find({ courseId: { $in: courseIds } })
      .sort({ createdAt: -1 });
    res.status(200).send({ success: true, data: announcements });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not fetch announcements.', error });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await announcementSchema.findByIdAndDelete(req.params.id);
    res.status(200).send({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Could not delete.', error });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncementsByCourse,
  getAnnouncementsForStudent,
  deleteAnnouncement,
};
