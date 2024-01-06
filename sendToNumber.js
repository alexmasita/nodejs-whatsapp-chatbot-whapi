const axios = require("axios");
const config = require("./config.js");

function sendToNumber(to, body) {
  const data = {
    to: `${to}@s.whatsapp.net`,
    body,
    typing_time: 4,
    view_once: true,
  };

  axios
    .post(`${config.apiUrl}/messages/text`, data, {
      headers: {
        Authorization: `Bearer ${config.token}`,
      },
    })
    .then((response) => console.log(response.data))
    .catch((error) => console.error(error));
}

module.exports = sendToNumber;
