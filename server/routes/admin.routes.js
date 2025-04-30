const express = require("express");
const {
  getUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  stats,
} = require("../controllers/adminController"); // Adjust path
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Middleware applied to all admin routes
router.use(protect);
router.use(authorize("admin")); // Only admins can access any route defined below

// User Management
router.get("/users", getUsers);
router.get("/users/appliers", getUsers); // Specific route for filtering
router.get("/users/employers", getUsers); // Specific route for filtering
router.get("/users/admins", getUsers); // Specific route for filtering
router.delete("/users/:id", deleteUser);

// Job Management
router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);
// Admin can use the main PUT /api/jobs/:id endpoint handled in job.routes.js

//Stats
router.get("/stats", stats);
module.exports = router;
