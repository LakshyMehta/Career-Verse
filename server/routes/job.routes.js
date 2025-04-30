const express = require("express");
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require("../controllers/jobController"); // Adjust path
const protect = require("../middleware/authMiddleware"); // Adjust path
const authorize = require("../middleware/roleMiddleware"); // Adjust path

const router = express.Router();

// Public/Protected routes (depends on if non-logged-in users can browse)
// Assuming only logged-in users can browse:
router
  .route("/")
  .get(protect, getAllJobs) // Any logged-in user can get all jobs
  .post(protect, authorize("employer", "admin"), createJob); // Only employer/admin can create

// --- Employer Specific Route ---
router.get("/my", protect, authorize("employer"), getMyJobs);

// --- Applier Specific Route ---
router
  .route("/:id")
  .get(protect, getJobById) // Any logged-in user can view a specific job
  .put(protect, authorize("employer", "admin"), updateJob) // Only owner-employer or admin can update
  .delete(protect, authorize("employer", "admin"), deleteJob); // Only owner-employer or admin can delete

module.exports = router;
