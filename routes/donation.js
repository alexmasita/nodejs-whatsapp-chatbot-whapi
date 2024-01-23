const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new donation within a group
router.get(
  "/create/:groupId",
  authMiddleware.isAuthenticated,
  donationController.getCreateDonation
);
router.post(
  "/create/:groupId",
  authMiddleware.isAuthenticated,
  donationController.postCreateDonation
);

// View all donations within a group
router.get(
  "/view/:groupId",
  authMiddleware.isAuthenticated,
  donationController.getAllDonationsByGroup
);

// Update a donation within a group
router.get(
  "/update/:id",
  authMiddleware.isAuthenticated,
  donationController.getUpdateDonation
);
router.post(
  "/update/:id",
  authMiddleware.isAuthenticated,
  donationController.postUpdateDonation
);

// Delete a donation within a group
router.get(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  donationController.getDeleteDonation
);

router.post(
  "/delete/:id",
  authMiddleware.isAuthenticated,
  donationController.postDeleteDonation
);

module.exports = router;
