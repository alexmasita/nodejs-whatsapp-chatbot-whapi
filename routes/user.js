// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new user
router.get(
  "/create",
  authMiddleware.isAuthenticated,
  userController.getCreateUser
);
router.post(
  "/create",
  authMiddleware.isAuthenticated,
  userController.postCreateUser
);

// View all users
router.get(
  "/view",
  authMiddleware.isAuthenticated,
  userController.viewAllUsers
);

// Update a user
router.get(
  "/update/:id",
  authMiddleware.isAuthenticated,
  userController.getUpdateUser
);
router.post(
  "/update/:id",
  authMiddleware.isAuthenticated,
  userController.postUpdateUser
);

// Delete a user
router.get(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  userController.getDeleteUser
);

router.post(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  userController.postDeleteUser
);

module.exports = router;
