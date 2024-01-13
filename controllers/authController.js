const authUtils = require("../utils/authUtils");
const phoneNumberUtils = require("../utils/phoneNumberUtils");
const verificationController = require("./verificationController");

const authController = {
  // ... other methods

  sendVerificationCode: async (req, res) => {
    try {
      const internationalCode = req.body.internationalCode;
      const phoneNumber = req.body.phoneNumber;

      // Use the phoneNumberUtils module to concatenate
      const fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
        internationalCode,
        phoneNumber
      );

      // Check if the fullPhoneNumber is allowed
      if (!authUtils.allowedPhoneNumbers.includes(fullPhoneNumber)) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const verificationCode = authUtils.generateVerificationCode();

      // Store the verification code in the database
      await verificationController.storeVerificationCode(
        fullPhoneNumber,
        verificationCode
      );

      // TODO: Send the verification code via WhatsApp

      // For simplicity, we'll just render the verification form for now
      res.render("verification", { phoneNumber: fullPhoneNumber });
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = authController;
