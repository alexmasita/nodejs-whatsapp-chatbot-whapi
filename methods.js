const { Client } = require("pg");
require("dotenv").config();

// Create a new client instance
console.log("connection info - process.env.DATABASE_URL");
console.log(process.env.DATABASE_URL);
let client = null;
if (process.env.NODE_ENV === "production") {
  console.log("entered production");
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
      require: process.env.NODE_ENV === "production" ? true : false,
    },
  });
} else {
  console.log("entered development");
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });
}

// Connect to the database
client.connect();

function addMessage(chat_id, text) {
  console.log("connection info from add message - process.env.DATABASE_URL");
  console.log(process.env.DATABASE_URL);
  const query = `INSERT INTO messages (chat_id, text) VALUES ($1, $2)`;
  client.query(query, [chat_id, text], (err, res) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      console.log("Inserted data into the database");
    }
  });
}

module.exports = addMessage;
