const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    creditHours: {
      type: Number,
    },
    fee: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true
    },
    adminId: {
      type: String,
      required: true,
    },
    semesterId: {
      type: String,
      ref: "semesters",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("courses", courseSchema);
