// routes/group.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

// Create a new group
router.get("/groups/create", groupController.getCreateGroup);
router.post("/groups/create", groupController.postCreateGroup);

// View all groups
router.get("/groups/view", groupController.viewAllGroups);

// Update a group
router.get("/groups/update/:id", groupController.getUpdateGroup);
router.post("/groups/update/:id", groupController.postUpdateGroup);

// Delete a group
router.get("/groups/delete/:id", groupController.getDeleteGroup);
router.post("/groups/delete/:id", groupController.postDeleteGroup);

module.exports = router;
