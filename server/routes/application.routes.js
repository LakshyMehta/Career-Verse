const express = require("express");
const {
  applyToJob,
  getMyApplications,
  updateMyApplication,
  getApplicationsForJob,
  updateApplicationStatus,
  checkApplicationStatus,
} = require("../controllers/applicationController"); // Adjust path
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const cvUpload = require("../middleware/cvUpload"); // Import Multer middleware

const router = express.Router();

// Applier routes
router.post(
  "/:jobId",
  protect,
  authorize("applier"),
  cvUpload.single("cv"),
  applyToJob
); // 'cv' is the field name in form-data
router.get("/mine", protect, authorize("applier"), getMyApplications);
// Note: The PUT route for applier update might need CV upload middleware too if updating CV
router.put(
  "/:id",
  protect,
  authorize("applier"),
  cvUpload.single("cv"),
  updateMyApplication
); // Added cvUpload here for CV update example

// Employer/Admin routes
router.get(
  "/job/:jobId",
  protect,
  authorize("employer", "admin"),
  getApplicationsForJob
);
router.patch(
  "/:id/status",
  protect,
  authorize("employer", "admin"),
  updateApplicationStatus
);

router.get(
  "/:jobId/application-status",
  protect,
  authorize("applier"), // Only the applier should check their status
  checkApplicationStatus
);

module.exports = router;
