const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads"); // Define relative to controller

// @desc    Get all users (or filter by role)
// @route   GET /api/admin/users
// @route   GET /api/admin/users/appliers
// @route   GET /api/admin/users/employers
// @access  Protected (Admin)
exports.getUsers = async (req, res) => {
  try {
    let filter = {};
    // Check specific path segments for filtering
    if (req.path.endsWith("/appliers")) {
      filter.role = "applier";
    } else if (req.path.endsWith("/employers")) {
      filter.role = "employer";
    } else if (req.path.endsWith("/admins")) {
      filter.role = "admin";
    }
    // Could also add query param filtering: ?role=applier etc.
    // if (req.query.role && ['admin', 'employer', 'applier'].includes(req.query.role)) {
    //     filter.role = req.query.role;
    // }

    const users = await User.find(filter).select("-password"); // Exclude passwords
    res.json(users);
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Protected (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from deleting themselves? Optional safeguard.
    // if (user._id.toString() === req.user._id.toString()) {
    //     return res.status(400).json({ message: 'Admin cannot delete themselves' });
    // }

    // Optional: Handle related data deletion (jobs posted by employer, applications by applier)
    if (user.role === "employer") {
      // Find jobs created by this employer
      const jobsToDelete = await Job.find({ createdBy: user._id });
      const jobIdsToDelete = jobsToDelete.map((job) => job._id);
      // Delete applications related to these jobs
      await Application.deleteMany({ jobId: { $in: jobIdsToDelete } });
      // Delete the jobs
      await Job.deleteMany({ createdBy: user._id });
      console.log(
        `Deleted jobs and related applications for employer ${user.email}`
      );
    } else if (user.role === "applier") {
      // Find and delete applications submitted by this applier
      const applications = await Application.find({ applierId: user._id });
      // Delete associated CV files
      applications.forEach((app) => {
        if (app.cvUrl) {
          const cvPath = path.join(uploadDir, app.cvUrl);
          fs.unlink(cvPath, (err) => {
            if (err && err.code !== "ENOENT")
              console.error(`Error deleting CV ${app.cvUrl}:`, err);
          });
        }
      });
      await Application.deleteMany({ applierId: user._id });
      console.log(`Deleted applications and CVs for applier ${user.email}`);
    }

    // Delete the user
    await User.deleteOne({ _id: req.params.id });

    res.json({ message: `User ${user.email} removed successfully` });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "User not found (Invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all jobs (Admin perspective)
// @route   GET /api/admin/jobs
// @access  Protected (Admin)
exports.getAllJobs = async (req, res) => {
  try {
    // Same as public getAllJobs but potentially could have more populated fields if needed
    const jobs = await Job.find().populate("createdBy", "name email role");
    res.json(jobs);
  } catch (error) {
    console.error("Admin Get All Jobs Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete any job (Admin perspective)
// @route   DELETE /api/admin/jobs/:id
// @access  Protected (Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Optional: Also delete related applications before deleting the job
    // await Application.deleteMany({ jobId: req.params.id });
    // Consider deleting CVs associated with those applications too

    await Job.deleteOne({ _id: req.params.id });

    res.json({ message: "Job removed successfully by admin" });
  } catch (error) {
    console.error("Admin Delete Job Error:", error);
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ message: "Job not found (Invalid ID format)" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc   Get admin stats (counts of users, jobs, applications)
// @route  GET /api/admin/stats
// @access Protected (Admin)
exports.stats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const employers = await User.countDocuments({ role: "employer" });
    const appliers = await User.countDocuments({ role: "applier" });
    const admins = await User.countDocuments({ role: "admin" });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Format response to match interface
    res.json({
      userCount: {
        total: totalUsers,
        employers,
        appliers,
        admins,
      },
      jobCount: totalJobs,
      applicationCount: totalApplications,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
