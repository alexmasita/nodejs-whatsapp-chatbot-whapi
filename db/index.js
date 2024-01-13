// db/index.js

const { Client } = require("pg");
require("dotenv").config();

let client = null;

// Function to initialize the database connection
function initializeDatabase() {
  if (!client) {
    if (process.env.NODE_ENV === "production") {
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
          require: process.env.NODE_ENV === "production" ? true : false,
        },
      });
    } else {
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
      });
    }

    client.connect();
  }
}

// Function to close the database connection
function closeDatabase() {
  if (client) {
    client.end();
    client = null;
  }
}

// Export functions to interact with the database
module.exports = {
  initializeDatabase,
  closeDatabase,
  query: async (text, values) => {
    try {
      // Ensure the database is initialized before executing queries
      initializeDatabase();

      const result = await client.query(text, values);
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
};
