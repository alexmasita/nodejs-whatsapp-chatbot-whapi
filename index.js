const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require("form-data");
const config = require("./config.js");
const addMessage = require("./methods.js");
const sendToNumberSdk = require("./sendToNumberSdk.js");

require("dotenv").config();

process.on("unhandledRejection", (err) => {
  console.log(err);
});

const COMMANDS = {
  TEXT: "Simple text message",
  IMAGE: "Send image",
  DOCUMENT: "Send document",
  VIDEO: "Send video",
  CONTACT: "Send contact",
  PRODUCT: "Send product",
  GROUP_CREATE: "Create group",
  GROUP_TEXT: "Simple text message for the group",
  GROUPS_IDS: "Get the id's of your three groups",
};

const FILES = {
  IMAGE: "./files/file_example_JPG_100kB.jpg",
  DOCUMENT: "./files/file-example_PDF_500_kB.pdf",
  VIDEO: "./files/file_example_MP4_480_1_5MG.mp4",
  VCARD: "./files/sample-vcard.txt",
};

/**
 * Send request to Whapi.Cloud
 * @param endpoint - endpoint path
 * @param params - request body
 * @param method - GET, POST, PATCH, DELETE
 * @returns {Promise<object>}
 */
async function sendWhapiRequest(endpoint, params = {}, method = "POST") {
  let options = {
    method: method,
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
  };
  if (!params.media) options.headers["Content-Type"] = "application/json";
  let url = `${config.apiUrl}/${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    if (method === "GET") url += "?" + new URLSearchParams(params);
    else
      options.body = params?.media
        ? toFormData(params)
        : JSON.stringify(params);
  }
  const response = await fetch(url, options);
  let json = await response.json();
  console.log("Whapi response:", JSON.stringify(json, null, 2));
  return json;
}

/**
 * Convert object to FormData
 * @param obj
 * @returns {FormData}
 */
function toFormData(obj) {
  const form = new FormData();
  for (let key in obj) {
    form.append(key, obj[key]);
  }
  return form;
}

async function setHook() {
  if (config.botUrl) {
    /** type {import('./whapi').Settings} */
    const settings = {
      // webhooks: [
      //   {
      //     url: config.botUrl,
      //     // events: [
      //     //   { type: "statuses", method: "post" },
      //     //   { type: "statuses", method: "put" },
      //     //   { type: "messages", method: "post" },
      //     // ],
      //     //mode: "body",
      //   },
      // ],
    };
    await sendWhapiRequest("settings", settings, "PATCH");
  }
}

async function handleNewMessages(req, res) {
  try {
    /** type {import('./whapi').Message[]} */
    const messages = req?.body?.messages;
    for (let message of messages) {
      if (message.from_me) continue;
      /** type {import('./whapi').Sender} */
      const sender = {
        to: message.chat_id,
      };
      let endpoint = "messages/text";
      const command = Object.keys(COMMANDS)[+message.text?.body?.trim() - 1];

      switch (command) {
        case "TEXT": {
          sender.body = "Simple text message";
          break;
        }
        case "IMAGE": {
          sender.caption = "Text under the photo.";
          sender.media = fs.createReadStream(FILES.IMAGE);
          endpoint = "messages/image";
          break;
        }
        case "DOCUMENT": {
          sender.caption = "Text under the document.";
          sender.media = fs.createReadStream(FILES.DOCUMENT);
          endpoint = "messages/document";
          break;
        }
        case "VIDEO": {
          sender.caption = "Text under the video.";
          sender.media = fs.createReadStream(FILES.VIDEO);
          endpoint = "messages/video";
          break;
        }
        case "CONTACT": {
          sender.name = "Whapi Test";
          sender.vcard = fs.readFileSync(FILES.VCARD).toString();
          endpoint = "messages/contact";
          break;
        }
        case "PRODUCT": {
          /* you can get real product id using endpoint  https://whapi.readme.io/reference/getproducts */
          endpoint = `business/products/${config.product}`;
          break;
        }
        case "GROUP_CREATE": {
          /* Warning : you can create group only with contacts from phone contact list */
          const res = await sendWhapiRequest(`groups`, {
            subject: "Whapi.Cloud Test",
            participants: [message.chat_id.split("@")[0]],
          });
          sender.body = res.group_id
            ? `Group created. Group id: ${res.group_id}`
            : "Error";
          break;
        }
        case "GROUP_TEXT": {
          /*To get group id, use /groups endpoint */
          sender.to = config.group;
          sender.body = "Simple text message for the group";
          break;
        }
        case "GROUPS_IDS": {
          const { groups } = await sendWhapiRequest(
            "groups",
            { count: 3 },
            "GET"
          );
          sender.body =
            (groups &&
              groups.reduce((prevVal, currVal, i) => {
                return i === 0
                  ? `${currVal.id} - ${currVal.name}`
                  : prevVal + ",\n " + `${currVal.id} - ${currVal.name}`;
              }, "")) ||
            "No groups";
          break;
        }
        default: {
          sender.body =
            "Hi. Send me a number from the list. Don't forget to change the actual data in the code!  \n\n" +
            Object.values(COMMANDS)
              .map((text, i) => `${i + 1}. ${text}`)
              .join("\n");
        }
      }
      await sendWhapiRequest(endpoint, sender);
    }
    res.send("Ok");
  } catch (e) {
    res.send(e.message);
  }
}

// Create a new instance of express
const app = express();
app.use(bodyParser.json());

app.get("/", function (req, res) {
  // const sdk = require("api")("@whapi/v1.7.5#3kd0flqp105bl");

  // sdk.auth(config.token);
  // sdk
  //   .sendMessageText({
  //     typing_time: 3,
  //     to: "254713590577",
  //     body: "New test!",
  //   })
  //   .then(({ data }) => console.log(data))
  //   .catch((err) => console.error(err));
  // res.send("Bot is running");
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donazy - Revolutionizing Group Donations on WhatsApp</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #f4f4f4;
      }

      .container {
        text-align: center;
        max-width: 600px;
      }

      h1 {
        color: #333;
      }

      p {
        color: #666;
        line-height: 1.5;
      }

      .connect-button {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        background-color: #4CAF50;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
      }

      @media (max-width: 600px) {
        .container {
          padding: 0 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Donazy</h1>
      <p>The ultimate solution for seamless and efficient group donations on WhatsApp!</p>
      <p>Are you tired of the chaos and inefficiency surrounding donation management in your WhatsApp groups? Look no further – Donazy is here to revolutionize the way you handle group contributions!</p>
      <a href="https://wa.me/254797727587?text=Hello%20Donazy!%20I%20am%20interested%20in%20managing%20group%20donations%20and%20would%20like%20to%20add%20you%20to%20my%20WhatsApp%20group.%20Can%20you%20guide%20me%20on%20the%20next%20steps%3F
      " class="connect-button">Connect with Donazy on WhatsApp</a>
    </div>
  </body>
  </html>
`;

  res.send(htmlContent);
});

app.post("/messages", handleNewMessages);

app.post("/webhook", (req, res) => {
  const messages = req.body.messages;
  console.log("process.env.DATABASE_URL");
  console.log(process.env.DATABASE_URL);
  if (messages) {
    console.log("messages");
    console.log(messages);
    messages.forEach((message) => {
      console.log("messages for each entered-message");
      console.log(message);
      if (!message.from_me) {
        const chat_id = message.chat_id.split("@")[0]; // Extracting phone number from chat_id
        const text = message.text.body;
        const incomingMessage = text.toLowerCase();
        console.log("incomingMessage");
        console.log(incomingMessage);
        if (incomingMessage.includes("hello donazy")) {
          // Automatically respond with your detailed instructions
          console.log("incomingMessage.includes - entered");
          const responseMessage = `
          🌟 Welcome to Donazy! 🌟

          Simplify group donations on WhatsApp:
          
          1. Add Donazy as a WhatsApp contact.
          2. Add Donazy to your group.
          3. Click the auto-sent link.
          4. Fill out and submit donation details.
          5. Your group gets a donation link with instructions.
          
          For other queries, ask below. We're here to help! 💚🙌          
`;

          sendToNumberSdk(chat_id, responseMessage);
        } else {
          // If the message doesn't match, wait for a live agent to respond
          // You can implement further actions or alert mechanisms here
          console.log("Waiting for a live agent to respond.");
        }

        console.log(`Received message from ${chat_id}: ${text}`);
        // Further processing: Database insertion, email forwarding, etc.
        addMessage(chat_id, text);
      }
    });
  } else {
    console.log(`Other objects`, req.body);
  }

  res.status(200).json({ status: "success" });
});

setHook().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, function () {
    console.log(`Listening on port ${port}...`);
  });
});
