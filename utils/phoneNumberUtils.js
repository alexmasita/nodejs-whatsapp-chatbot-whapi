// phoneNumberUtils.js
module.exports = {
  concatenatePhoneNumber: (internationalCode, phoneNumber) => {
    // Remove leading '0' from the phone number
    const trimmedPhoneNumber = phoneNumber.replace(/^0/, "");

    // Concatenate international code and the trimmed phone number
    const fullPhoneNumber = `${internationalCode}${trimmedPhoneNumber}`;

    return fullPhoneNumber;
  },
};
