const authUtils = require("../utils/authUtils");
const authQueries = require("../db/queries/authQueries");

const verificationController = {
  storeVerificationCode: async (phoneNumber, code) => {
    try {
      await authQueries.storeVerificationCode(phoneNumber, code);
    } catch (error) {
      console.error("Error storing verification code:", error);
      throw new Error("Internal Server Error");
    }
  },

  getVerificationCode: async (phoneNumber) => {
    try {
      const storedCode = await authQueries.getVerificationCode(phoneNumber);
      return storedCode && storedCode.code;
    } catch (error) {
      console.error("Error getting verification code:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = verificationController;
