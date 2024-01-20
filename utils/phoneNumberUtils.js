// phoneNumberUtils.js
module.exports = {
  concatenatePhoneNumber: (internationalCode, phoneNumber) => {
    // Remove non-numeric characters from international code
    const numericInternationalCode = internationalCode.replace(/\D/g, "");

    // Remove leading '0' from the phone number
    const trimmedPhoneNumber = phoneNumber.replace(/^0/, "");

    // Concatenate numeric international code and the trimmed phone number
    const fullPhoneNumber = `${numericInternationalCode}${trimmedPhoneNumber}`;

    return fullPhoneNumber;
  },
};
