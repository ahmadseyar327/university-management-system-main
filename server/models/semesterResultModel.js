const mongoose = require('mongoose');
const { SEMESTER_RESULT } = require('../utils/academicRules');

const semesterResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    programId: { type: String, required: true },
    semesterNumber: { type: Number, required: true, min: 1, max: 8 },
    result: {
      type: String,
      enum: Object.values(SEMESTER_RESULT),
      default: SEMESTER_RESULT.PENDING,
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedByAdminId: { type: String, default: '' },
    reviewedByAdminId: { type: String, default: '' },
  },
  { timestamps: true }
);

semesterResultSchema.index({ studentId: 1, programId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model('semesterResults', semesterResultSchema);
