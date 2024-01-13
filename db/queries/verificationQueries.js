const db = require("..");

const verificationQueries = {
  // SQL query to store a verification code
  storeVerificationCode: (phoneNumber, code) => {
    return db.none(
      "INSERT INTO verification_codes(phone_number, code) VALUES($1, $2)",
      [phoneNumber, code]
    );
  },

  // SQL query to retrieve a verification code by phone number
  getVerificationCode: (phoneNumber) => {
    return db.oneOrNone(
      "SELECT code FROM verification_codes WHERE phone_number = $1",
      phoneNumber
    );
  },
};

module.exports = verificationQueries;
