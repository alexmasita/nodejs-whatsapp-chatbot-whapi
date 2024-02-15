const { dbInstance: db } = require("../../db");
const phoneNumberUtils = require("../../utils/phoneNumberUtils");

const userQueries = {
  createUser: async (userData, transaction) => {
    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedInternationalCode =
      phoneNumberUtils.sanitizeInternationalCode(userData.international_code);
    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
      userData.phone_number
    );

    const query =
      "INSERT INTO users (name, international_code, phone_number) VALUES (${name}, ${international_code}, ${phone_number}) RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, {
        ...userData,
        international_code: strippedInternationalCode,
        phone_number: strippedPhoneNumber,
      });
    } else {
      // Execute the query without a transaction
      return db.one(query, {
        ...userData,
        international_code: strippedInternationalCode,
        phone_number: strippedPhoneNumber,
      });
    }
  },
  updateUser: async (userId, updatedData, transaction) => {
    // Call ensureTableSchema before updating a user
    // await userQueries.ensureUserTableSchema();
    console.log("update User id: ", userId);
    // Extract the individual fields from the updatedData object
    const { name, id_number, phone_number, international_code } = updatedData;

    console.log("international_code");
    console.log(international_code);
    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedInternationalCode =
      phoneNumberUtils.sanitizeInternationalCode(international_code);

    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedPhoneNumber =
      phoneNumberUtils.sanitizePhoneNumber(phone_number);

    const query =
      "UPDATE users SET name = $2, id_number = $3, international_code = $4, phone_number = $5 WHERE id = $1 RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, [
        userId,
        name,
        id_number,
        strippedInternationalCode || 254,
        strippedPhoneNumber,
      ]);
    } else {
      // Execute the query without a transaction
      return db.one(query, [
        userId,
        name,
        id_number,
        strippedInternationalCode,
        strippedPhoneNumber,
      ]);
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
  getUserByPhoneNumber: async (internationalCode, phoneNumber, transaction) => {
    // Call ensureTableSchema before fetching a user by phone number

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
        {
          name: "",
          international_code: internationalCode,
          phone_number: phoneNumber,
        },
        transaction
      );

      // Return the newly created user
      return newUser;
    }
  },
  deleteUser: async (userId, transaction) => {
    // Call ensureTableSchema before deleting a user
    // await userQueries.ensureUserTableSchema();

    const query =
      "UPDATE users SET is_deleted = true WHERE id = $1 RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, userId);
    } else {
      // Execute the query without a transaction
      return db.one(query, userId);
    }
  },

  getAllUsers: async () => {
    // Call ensureTableSchema before fetching all users
    // await userQueries.ensureUserTableSchema();

    return db.manyOrNone("SELECT * FROM users WHERE is_deleted = false");
  },
};

module.exports = userQueries;
