// routes/index.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");
const verificationRoutes = require("./verification");

// Route to display the login form
router.get("/login", (req, res) => {
  res.render("login");
});

// Route to list all groups (requires authentication)
router.get("/groups", authMiddleware.authenticate, groupController.listGroups);

// Nested route for verification codes
router.use("/verification", verificationRoutes);

// ... other routes

module.exports = router;
