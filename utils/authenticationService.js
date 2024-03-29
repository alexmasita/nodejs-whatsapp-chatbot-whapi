const sendWhatsAppVerification = require("./sendWhatsAppVerification");
const userQueries = require("../db/queries/userQueries"); // Update the path accordingly
const authQueries = require("../db/queries/authQueries");

const authenticationService = {
  sendVerificationCode: async (phoneNumber, req) => {
    try {
      const verificationCode = await sendWhatsAppVerification(phoneNumber, req);

      // Store the verification code securely (e.g., in-memory cache or database)
      await authQueries.insertOrUpdateVerificationCode(
        phoneNumber,
        verificationCode
      );

      return {
        success: true,
        message: "Verification code sent successfully",
        phoneNumber,
        verificationCode,
      };
    } catch (error) {
      console.error("Error sending verification code:", error);
      return { success: false, message: "Failed to send verification code" };
    }
  },

  getUserByPhoneNumber: async (internationalCode, phoneNumber) => {
    // Fetch user from the database based on the phone number
    return userQueries.getUserByPhoneNumber(internationalCode, phoneNumber);
  },

  // Use an in-memory cache for simplicity (replace with a database in production)
};

module.exports = authenticationService;
