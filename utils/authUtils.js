// utils/authUtils.js
const db = require("../db");

const verificationCodes = {};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const storeVerificationCode = (phoneNumber, code) => {
  verificationCodes[phoneNumber] = code;
};

const getVerificationCode = (phoneNumber) => {
  return verificationCodes[phoneNumber];
};

const fetchAllowedPhoneNumbers = async () => {
  try {
    // Fetch users with role 'admin' from the user_groups table
    const result = await db.query(`
      SELECT u.phone_number
      FROM users u
      JOIN user_groups ug ON u.id = ug.user_id
      WHERE u.role = 'admin'
    `);

    // Extract phone numbers from the result
    const allowedPhoneNumbers = result.rows.map((user) => user.phone_number);
    return allowedPhoneNumbers;
  } catch (error) {
    console.error("Error fetching allowed phone numbers:", error);
    throw error;
  }
};

module.exports = {
  verificationCodes,
  generateVerificationCode,
  storeVerificationCode,
  getVerificationCode,
  fetchAllowedPhoneNumbers,
  // Other utility functions...
};
