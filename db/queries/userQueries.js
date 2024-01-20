const { dbInstance: db } = require("../../db");
const ensureTableSchema = require("../../utils/ensureTableSchema");

const userQueries = {
  ensureUserTableSchema: async () => {
    console.log("ensureUserTableSchema called");
    const tableName = "users";
    const columnDataTypes = {
      id: "serial",
      name: "varchar(255)",
      phone_number: "varchar(15) unique",
      is_deleted: "boolean default false",
    };
    const primaryKey = { columns: ["id"], type: "serial" };
    const tableConstraints = [
      { type: "primary key", columns: ["id"] },
      // Add more constraints as needed
    ];

    await ensureTableSchema(
      tableName,
      columnDataTypes,
      primaryKey,
      tableConstraints
    );
  },

  createUser: async (userData, transaction) => {
    // Call ensureTableSchema before creating a user
    //await userQueries.ensureUserTableSchema();
    // Strip non-numeric characters from the phone number
    const strippedPhoneNumber = userData.phone_number.replace(/[\D\s]/g, "");

    const query =
      "INSERT INTO users (name, phone_number) VALUES (${name}, ${phone_number}) RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, {
        ...userData,
        phone_number: strippedPhoneNumber,
      });
    } else {
      // Execute the query without a transaction
      return db.one(query, { ...userData, phone_number: strippedPhoneNumber });
    }
  },
  updateUser: async (userId, updatedData, transaction) => {
    // Call ensureTableSchema before updating a user
    // await userQueries.ensureUserTableSchema();
    console.log("update User id: ", userId);
    // Extract the individual fields from the updatedData object
    const { name, phone_number } = updatedData;

    // Strip non-numeric characters from the phone number
    const strippedPhoneNumber = phone_number.replace(/[\D\s]/g, "");

    const query =
      "UPDATE users SET name = $2, phone_number = $3 WHERE id = $1 RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, [userId, name, strippedPhoneNumber]);
    } else {
      // Execute the query without a transaction
      return db.one(query, [userId, name, strippedPhoneNumber]);
    }
  },

  getUserById: async (userId) => {
    // Call ensureTableSchema before fetching a user by ID
    // await userQueries.ensureUserTableSchema();

    return db.oneOrNone(
      "SELECT * FROM users WHERE id = $1 AND is_deleted = false",
      userId
    );
  },
  getUserByPhoneNumber: async (phoneNumber, transaction) => {
    // Call ensureTableSchema before fetching a user by phone number
    // await userQueries.ensureUserTableSchema();

    // Try to find the user by phone number
    const existingUser = await db.oneOrNone(
      "SELECT * FROM users WHERE phone_number = $1 AND is_deleted = false",
      phoneNumber
    );

    if (existingUser) {
      // If user exists, return the found user
      return existingUser;
    } else {
      // If user doesn't exist, create a new user with the provided phone number
      const newUser = await userQueries.createUser(
        { name: "", phone_number: phoneNumber },
        transaction
      );

      // Return the newly created user
      return newUser;
    }
  },
};

module.exports = userQueries;
