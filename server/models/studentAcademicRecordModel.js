const mongoose = require('mongoose');
const { STUDENT_STATUS } = require('../utils/academicRules');

const studentAcademicRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    programId: {
      type: String,
      required: true,
      index: true,
    },
    currentSemester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 1,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(STUDENT_STATUS),
      default: STUDENT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('studentAcademicRecords', studentAcademicRecordSchema);
