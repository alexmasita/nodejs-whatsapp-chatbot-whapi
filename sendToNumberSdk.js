const config = require("./config.js");
const sdk = require("api")("@whapi/v1.7.5#3kd0flqp105bl");

sdk.auth(config.token);

function sendToNumberSdk(to, body) {
  sdk
    .sendMessageText({
      typing_time: 3,
      to,
      body,
    })
    .then(({ data }) => console.log(data))
    .catch((err) => console.error(err));
}
module.exports = sendToNumberSdk;
