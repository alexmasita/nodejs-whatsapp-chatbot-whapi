// routes/index.js
const express = require("express");
const router = express.Router();
const groupRoutes = require("./group");
const authRoutes = require("./auth");
const userRoutes = require("./user");
const donationRoutes = require("./donation");

// Nested route for authRoutes codes
router.use("/auth", authRoutes);
// Nested route for userRoutes codes
router.use("/users", userRoutes);
// Nested route for groupRoutes codes
router.use("/groups", groupRoutes);
// Nested route for donationRoutes codes
router.use("/donations", donationRoutes);
// ... other routes

module.exports = router;
