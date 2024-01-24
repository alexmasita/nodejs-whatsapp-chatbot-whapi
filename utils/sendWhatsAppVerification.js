// Assuming you have a WhatsApp API client or a service to send messages
const sendToNumberSdk = require("../sendToNumberSdk.js");

// Function to generate and send a verification code via WhatsApp
const sendWhatsAppVerification = async (phoneNumber, req) => {
  // Generate a random 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Send the verification code via WhatsApp
  try {
    console.log("Your verification code is:", verificationCode);
    console.log("Your phoneNumber is:", phoneNumber);

    const baseUrl = `${req.protocol}://${req.get("host")}`; // Explicitly set the base URL

    // Constructing the message body
    const messageBody = `Click link to setup donation group: ${baseUrl}/auth/validate?code=${verificationCode}`;

    // Sending the message
    await sendToNumberSdk({
      to: phoneNumber.toString(),
      body: messageBody,
    });

    // Return the generated verification code
    return verificationCode;
  } catch (error) {
    console.error("Error sending WhatsApp verification:", error);
    throw new Error("Failed to send WhatsApp verification");
  }
};

module.exports = sendWhatsAppVerification;
