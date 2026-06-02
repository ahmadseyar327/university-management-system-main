const mongoose = require('mongoose');

const semesterRegistrationSchema = new mongoose.Schema(
  {
    programId: { type: String, required: true, index: true },
    targetSemester: {
      type: Number,
      required: true,
      min: 2,
      max: 8,
    },
    isOpen: { type: Boolean, default: false },
    openedAt: { type: Date },
    closedAt: { type: Date },
    openedByAdminId: { type: String, default: '' },
  },
  { timestamps: true }
);

semesterRegistrationSchema.index({ programId: 1, targetSemester: 1 }, { unique: true });

module.exports = mongoose.model('semesterRegistrations', semesterRegistrationSchema);
