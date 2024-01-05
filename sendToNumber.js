const axios = require("axios");
const config = require("./config.js");

const data = {
  to: "254713590577@s.whatsapp.net",
  body: "Testing Script!",
  typing_time: 2,
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
