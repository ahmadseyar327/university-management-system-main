const mongoose = require("mongoose");

const offeredCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      required: true,
    },
    instructorId: {
      type: String,
      required: true,
    },
    programId: {
      type: String,
      default: '',
    },
    semesterNumber: {
      type: Number,
      min: 1,
      max: 8,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
      required: true,
    },
    reviewedByAdminId: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("offeredCourse", offeredCourseSchema);
