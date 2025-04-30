const Job = require("../models/Job");
const User = require("../models/User"); // Needed potentially for checks

// @desc    Get all jobs (publicly viewable)
// @route   GET /api/jobs
// @access  Public (or Protected if only logged-in users can see)
// NOTE: Requirement says "Browse available jobs", implies any logged-in user.
// If public access needed, remove protect middleware from route.
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("createdBy", "name email"); // Populate creator info
    res.json(jobs);
  } catch (error) {
    console.error("Get All Jobs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Protected (any logged-in user)
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    console.error("Get Job By ID Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Job not found (Invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Protected (Employer, Admin)
exports.createJob = async (req, res) => {
  const { title, description, location } = req.body;

  if (!title || !description || !location) {
    return res
      .status(400)
      .json({ message: "Please provide title, description, and location" });
  }

  try {
    const job = new Job({
      title,
      description,
      location,
      createdBy: req.user._id, // User ID from authMiddleware
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    console.error("Create Job Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Protected (Employer who owns job, Admin)
exports.updateJob = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Authorization Check: User must be admin or the employer who created the job
    if (
      req.user.role !== "admin" &&
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "User not authorized to update this job" });
    }

    // Update fields if provided
    if (title) job.title = title;
    if (description) job.description = description;
    if (location) job.location = location;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error("Update Job Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Job not found (Invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Protected (Employer who owns job, Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Authorization Check: User must be admin or the employer who created the job
    if (
      req.user.role !== "admin" &&
      job.createdBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this job" });
    }

    await Job.deleteOne({ _id: req.params.id }); // Use deleteOne or findByIdAndDelete

    // Optional: Also delete related applications (or handle cascading deletes differently)
    // await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: "Job removed successfully" });
  } catch (error) {
    console.error("Delete Job Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Job not found (Invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get jobs posted by the logged-in employer
// @route   GET /api/jobs/my
// @access  Protected (Employer)
exports.getMyJobs = async (req, res) => {
  // req.user is available from the protect middleware
  // req.user.role check is handled by the authorize middleware in the route

  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    }); // Sort by newest first, for example

    res.json(jobs);
  } catch (error) {
    console.error("Get My Jobs Error:", error);
    res.status(500).json({ message: "Server Error fetching your jobs" });
  }
};
