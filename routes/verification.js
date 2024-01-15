const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const verificationController = require("../controllers/verificationController");

// Route to store a verification code (requires authentication)
router.post("/store", authMiddleware.authenticate, async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    // Store the verification code in the database
    await verificationController.storeVerificationCode(phoneNumber, code);

    res.json({ success: true });
  } catch (error) {
    console.error("Error storing verification code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to retrieve a verification code (requires authentication)
router.get(
  "/retrieve/:phoneNumber",
  authMiddleware.authenticate,
  async (req, res) => {
    try {
      const phoneNumber = req.params.phoneNumber;

      // Retrieve the verification code from the database
      const storedCode = await verificationController.getVerificationCode(
        phoneNumber
      );

      res.json({ code: storedCode });
    } catch (error) {
      console.error("Error retrieving verification code:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route to send a verification code (requires authentication)
router.post("/send-code", authMiddleware.authenticate, async (req, res) => {
  try {
    console.log("send-code called req obj");
    console.log(req);
    await authController.sendVerificationCode(req, res);
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to verify the code (requires authentication)
router.post("/verify-code", authMiddleware.authenticate, async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    // Verify the entered code
    const isCodeValid = await verificationController.verifyCode(
      phoneNumber,
      code
    );

    if (isCodeValid) {
      // Code is correct, authentication successful
      // Set the authenticated user in the request object
      req.user = { phoneNumber };

      // Redirect to the main route or render a success page
      res.redirect("/groups");
    } else {
      // Incorrect code
      res.status(401).json({ error: "Invalid verification code" });
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;