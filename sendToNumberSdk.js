const config = require("./config.js");
const sdk = require("api")("@whapi/v1.7.5#3kd0flqp105bl");

sdk.auth(config.token);

// function sendToNumberSdk(to, body) {
//   console.log("sendToNumberSdk - to");
//   console.log(to);
//   sdk
//     .sendMessageText({
//       typing_time: 3,
//       to,
//       body,
//     })
//     .then(({ data }) => console.log(data))
//     .catch((err) => console.error(err));
// }
async function sendToNumberSdk({ to, body }) {
  console.log("sendToNumberSdk - to");
  console.log(to);

  try {
    const { data } = await sdk.sendMessageText({
      typing_time: 3,
      to,
      body,
    });

    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error if needed
  }
}
module.exports = sendToNumberSdk;
