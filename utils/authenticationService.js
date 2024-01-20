const sendWhatsAppVerification = require("./sendWhatsAppVerification");
const userQueries = require("../db/queries/userQueries"); // Update the path accordingly
const verificationQueries = require("../db/queries/verificationQueries");

const authenticationService = {
  sendVerificationCode: async (phoneNumber) => {
    try {
      const verificationCode = await sendWhatsAppVerification(phoneNumber);

      // Store the verification code securely (e.g., in-memory cache or database)
      await verificationQueries.insertOrUpdateVerificationCode(
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

  getUserByPhoneNumber: async (phoneNumber) => {
    // Fetch user from the database based on the phone number
    return userQueries.getUserByPhoneNumber(phoneNumber);
  },

  // Use an in-memory cache for simplicity (replace with a database in production)
};

module.exports = authenticationService;
