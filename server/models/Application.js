const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cvUrl: {
      // Stores the path/filename relative to the uploads dir
      type: String,
      required: [true, "CV is required"],
    },
    status: {
      type: String,
      enum: ["applied", "selected", "rejected"],
      default: "applied",
    },
  },
  { timestamps: true }
); // Adds createdAt and updatedAt fields

// Ensure an applier can only apply once to the same job
applicationSchema.index({ jobId: 1, applierId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
