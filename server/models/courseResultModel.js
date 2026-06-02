const mongoose = require('mongoose');
const { PASS_FAIL } = require('../utils/academicRules');

const courseResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    courseId: { type: String, required: true, index: true },
    instructorId: { type: String, required: true },
    programId: { type: String, required: true },
    semesterNumber: { type: Number, required: true, min: 1, max: 8 },
    midExamMarks: { type: Number, default: 0, min: 0, max: 20 },
    finalExamMarks: { type: Number, default: 0, min: 0, max: 80 },
    totalMarks: { type: Number, default: 0, min: 0, max: 100 },
    passFailStatus: {
      type: String,
      enum: Object.values(PASS_FAIL),
      default: PASS_FAIL.FAIL,
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

courseResultSchema.index({ studentId: 1, courseId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model('courseResults', courseResultSchema);
