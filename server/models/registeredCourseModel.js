const mongoose = require("mongoose");

const registeredCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      ref: "courses",
      required: true,
    },
    instructorId: {
      type: String,
      ref: "instructors",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
    programId: {
      type: String,
      ref: "programs",
    },
    semesterNumber: {
      type: Number,
      min: 1,
      max: 8,
    },
    enrollmentType: {
      type: String,
      enum: ["semester_auto", "manual"],
      default: "manual",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("registeredCourse", registeredCourseSchema);
