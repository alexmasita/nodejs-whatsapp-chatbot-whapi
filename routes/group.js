// routes/group.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new group
router.get(
  "/create",
  authMiddleware.isAuthenticated,
  groupController.getCreateGroup
);
router.post(
  "/create",
  authMiddleware.isAuthenticated,
  groupController.postCreateGroup
);

// View all groups
router.get(
  "/view",
  authMiddleware.isAuthenticated,
  groupController.viewAllGroups
);

// Update a group
router.get(
  "/update/:id",
  authMiddleware.isAuthenticated,
  groupController.getUpdateGroup
);
router.post(
  "/update/:id",
  authMiddleware.isAuthenticated,
  groupController.postUpdateGroup
);

// Delete a group
router.get(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  groupController.getDeleteGroup
);

router.post(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  groupController.postDeleteGroup
);
module.exports = router;
