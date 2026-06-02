const mongoose = require('mongoose');
const { TOTAL_SEMESTERS } = require('../utils/academicRules');

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    totalSemesters: {
      type: Number,
      default: TOTAL_SEMESTERS,
      min: TOTAL_SEMESTERS,
      max: TOTAL_SEMESTERS,
    },
    adminId: {
      type: String,
      default: '',
    },
    isLegacy: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('programs', programSchema);
