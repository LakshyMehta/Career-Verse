const express = require("express");
const { register, login } = require("../controllers/authController"); // Adjust path

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// Logout is typically handled client-side (removing the token)

module.exports = router;
