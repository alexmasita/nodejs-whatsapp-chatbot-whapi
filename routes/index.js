// routes/index.js
const express = require("express");
const router = express.Router();
const verificationRoutes = require("./verification");
const groupRoutes = require("./group");
const authRoutes = require("./auth");
const donationRoutes = require("./donation");

router.use("/auth", authRoutes);
// Nested route for verification codes
router.use("/verification", verificationRoutes);
// Nested route for groups codes
router.use("/groups", groupRoutes);
// Nested route for donations codes
router.use("/donations", donationRoutes);
// ... other routes

module.exports = router;
