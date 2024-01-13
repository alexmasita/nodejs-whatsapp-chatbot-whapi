const authUtils = require("../utils/authUtils");
const verificationQueries = require("../db/queries/verificationQueries");

const verificationController = {
  storeVerificationCode: async (phoneNumber, code) => {
    try {
      await verificationQueries.storeVerificationCode(phoneNumber, code);
    } catch (error) {
      console.error("Error storing verification code:", error);
      throw new Error("Internal Server Error");
    }
  },

  getVerificationCode: async (phoneNumber) => {
    try {
      const storedCode = await verificationQueries.getVerificationCode(
        phoneNumber
      );
      return storedCode && storedCode.code;
    } catch (error) {
      console.error("Error getting verification code:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = verificationController;
