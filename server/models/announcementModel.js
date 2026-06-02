const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, index: true },
    instructorId: { type: String, required: true },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('announcements', announcementSchema);
