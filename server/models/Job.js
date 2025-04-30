const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (employer or admin)
      required: true,
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
