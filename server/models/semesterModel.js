const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    programId: {
      type: String,
      required: true,
      index: true,
    },
    semesterNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

semesterSchema.index({ programId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model('semesters', semesterSchema);
