// db/index.js

const { initializeDatabase, closeDatabase, query } = require("./db");

// Export the dbInstance
module.exports = {
  initializeDatabase,
  closeDatabase,
  query,
  dbInstance: require("./db").getDbInstance(),
};
