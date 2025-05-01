const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); // Needed for uploads directory check
const multer = require("multer"); // Needed for file upload handling

// Load env vars
dotenv.config();

// Route Files
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const adminRoutes = require("./routes/admin.routes");

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Check if MONGODB_URI exists in environment variables
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    // Log the Mongo URI for debugging (be careful with logs in production)
    console.log('Mongo URI:', mongoURI);

    // Attempt to connect to MongoDB (no need for deprecated options)
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// --- CV File Access ---
// Option 1: Serve the uploads folder statically (Simpler, less secure if folder is predictable)
// Make sure the path is correct relative to server.js
const uploadsPath = path.join(__dirname, "uploads");
// Check if uploads directory exists, create if not
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log(`Created directory: ${uploadsPath}`);
}
app.use("/uploads", express.static(uploadsPath));
console.log(`Serving static files from: ${uploadsPath} at /uploads`);
// Access CVs via: http://<your_server_address>:<port>/uploads/<filename_stored_in_db>
// You might want to protect this route with auth/authz middleware depending on requirements.

// Option 2: (Alternative - More Secure) Create a protected route to download CVs
// This would involve a new route like GET /api/applications/:id/cv that reads the file
// using fs.createReadStream and pipes it to the response after checking authorization.

// Mount Routers
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);

// Basic Root Route
app.get("/", (req, res) => {
  res.send("Job Portal API Running");
});

// --- Basic Error Handling Middleware --- (Place after routes)
// Catch Multer errors specifically
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File is too large. Maximum size is 5MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ message: err.message || "Invalid file type provided." });
    }
    // Handle other Multer errors if necessary
    return res
      .status(400)
      .json({ message: `File upload error: ${err.message}` });
  } else if (err) {
    // Handle other errors (like validation errors passed via next(err))
    console.error("Unhandled Error:", err); // Log the error for debugging
    return res
      .status(err.status || 500)
      .json({ message: err.message || "An unexpected error occurred" });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
