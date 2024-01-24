// const db = require("..");
const { dbInstance: db } = require("..");

const authQueries = {
  // SQL query to store a verification code
  insertOrUpdateVerificationCode: async (phoneNumber, code) => {
    try {
      await db.none(
        `
        INSERT INTO verification_codes (phone_number, code)
        VALUES ($1, $2)
        ON CONFLICT (phone_number) DO UPDATE
        SET code = $2
        `,
        [phoneNumber, code]
      );
    } catch (error) {
      console.error("Error inserting or updating verification code:", error);
      throw error;
    }
  },

  getVerificationCode: async (phoneNumber) => {
    try {
      const result = await db.oneOrNone(
        "SELECT code FROM verification_codes WHERE phone_number = $1",
        [phoneNumber]
      );
      return result ? result.code : null;
    } catch (error) {
      console.error("Error getting verification code:", error);
      throw error;
    }
  },
};

module.exports = authQueries;
