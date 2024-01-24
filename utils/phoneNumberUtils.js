// phoneNumberUtils.js
module.exports = {
  concatenatePhoneNumber: (internationalCode, phoneNumber) => {
    // Check if values are strings before converting
    const codeString =
      typeof internationalCode === "string" ? internationalCode : "";
    const numberString = typeof phoneNumber === "string" ? phoneNumber : "";

    // Remove non-numeric characters from international code
    const numericInternationalCode = codeString.replace(/\D/g, "");

    // Remove leading zeros, non-numeric characters, and spaces from the formatted phone number
    const trimmedPhoneNumber = numberString
      .replace(/[\D\s]/g, "")
      .replace(/^0+/, "");

    // Concatenate numeric international code and the trimmed phone number
    const fullPhoneNumber = `${numericInternationalCode}${trimmedPhoneNumber}`;

    return fullPhoneNumber;
  },

  sanitizePhoneNumber: (phoneNumber) => {
    // Check if value is a string before converting
    const numberString = typeof phoneNumber === "string" ? phoneNumber : "";

    // Remove non-numeric characters and spaces from the formatted phone number
    const sanitizedPhoneNumber = numberString.replace(/[\D\s]/g, "");

    return sanitizedPhoneNumber;
  },

  sanitizeInternationalCode: (internationalCode) => {
    // Check if value is a string before converting
    const codeString =
      typeof internationalCode === "string" ? internationalCode : "";

    // Remove non-numeric characters from international code
    const sanitizedInternationalCode = codeString.replace(/\D/g, "");

    return sanitizedInternationalCode;
  },
};
