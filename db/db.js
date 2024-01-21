// // db/db.js

// const pgp = require("pg-promise")();
// require("dotenv").config();

// let dbInstance;

// // Function to get or initialize the database instance
// function getDbInstance() {
//   if (!dbInstance) {
//     dbInstance = pgp(process.env.DATABASE_URL);
//   }
//   return dbInstance;
// }

// // Function to initialize the database connection
// function initializeDatabase() {
//   try {
//     const db = getDbInstance();
//     db.$pool.end(); // Close the existing connection pool
//     db.$pool = null; // Ensure the pool is reset

//     // Create a new connection pool
//     db.$pool = pgp(process.env.DATABASE_URL).$pool;
//   } catch (error) {
//     console.error("Database initialization error:", error);
//     throw error;
//   }
// }

// // Function to close the database connection
// function closeDatabase() {
//   if (dbInstance) {
//     dbInstance.$pool.end();
//     dbInstance = null;
//   }
// }

// module.exports = {
//   initializeDatabase,
//   closeDatabase,
//   query: async (text, values) => {
//     try {
//       const db = getDbInstance();
//       const result = await db.query(text, values);
//       return result;
//     } catch (error) {
//       console.error("Database query error:", error);
//       throw error;
//     }
//   },
//   getDbInstance,
// };

// db/db.js

const pgp = require("pg-promise")({
  connect(client, dc, useCount) {
    const sslOptions =
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false, require: true }
        : false;

    console.log("db.js sslOptions");
    console.log(sslOptions);

    const pool = new pgp.pg.Pool({
      ssl: sslOptions,
    });

    return pool;
  },
});
require("dotenv").config();

let dbInstance;

// Function to get or initialize the database instance
function getDbInstance() {
  if (!dbInstance) {
    dbInstance = pgp(process.env.DATABASE_URL);
  }
  return dbInstance;
}

// Function to initialize the database connection
function initializeDatabase() {
  try {
    const db = getDbInstance();
    db.$pool.end(); // Close the existing connection pool
    db.$pool = null; // Ensure the pool is reset

    // Create a new connection pool
    db.$pool = pgp(process.env.DATABASE_URL).$pool;
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Function to close the database connection
function closeDatabase() {
  if (dbInstance) {
    dbInstance.$pool.end();
    dbInstance = null;
  }
}

module.exports = {
  initializeDatabase,
  closeDatabase,
  query: async (text, values) => {
    try {
      const db = getDbInstance();
      const result = await db.query(text, values);
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },
  getDbInstance,
};
