// routes/index.js
const express = require("express");
const router = express.Router();
// const groupController = require("../controllers/groupController");
// const authMiddleware = require("../middlewares/authMiddleware");
const verificationRoutes = require("./verification");
const groupRoutes = require("./group");
const authRoutes = require("./auth");

// Route to list all groups (requires authentication)
// router.get("/groups", authMiddleware.authenticate, groupController.listGroups);

// // Create a new group
// router.get("/groups/create", groupController.getCreateGroup);
// router.post("/groups/create", groupController.postCreateGroup);

// // View all groups
// router.get("/groups/view", groupController.viewAllGroups);

// // Update a group
// router.get("/groups/update/:id", groupController.getUpdateGroup);
// router.post("/groups/update/:id", groupController.postUpdateGroup);

// // Delete a group
// router.get("/groups/delete/:id", groupController.getDeleteGroup);
// router.post("/groups/delete/:id", groupController.postDeleteGroup);

router.use("/auth", authRoutes);
// Nested route for verification codes
router.use("/verification", verificationRoutes);
// Nested route for groups codes
router.use("/groups", groupRoutes);

// ... other routes

module.exports = router;
