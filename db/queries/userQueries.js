const { dbInstance: db } = require("../../db");

const userQueries = {
  createUser: async (userData, transaction) => {
    // Call ensureTableSchema before creating a user

    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedInternationalCode = userData.international_code.replace(
      /[\D\s]/g,
      ""
    );
    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedPhoneNumber = userData.phone_number
      .replace(/[\D\s]/g, "")
      .replace(/^0+/, "");

    const query =
      "INSERT INTO users (name, phone_number) VALUES (${name}, ${phone_number}) RETURNING *";

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
    const { name, phone_number, international_code } = updatedData;

    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedInternationalCode = international_code.replace(/[\D\s]/g, "");
    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedPhoneNumber = phone_number
      .replace(/[\D\s]/g, "")
      .replace(/^0+/, "");

    const query =
      "UPDATE users SET name = $2, international_code = $3, phone_number = $4 WHERE id = $1 RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, [
        userId,
        name,
        strippedInternationalCode,
        strippedPhoneNumber,
      ]);
    } else {
      // Execute the query without a transaction
      return db.one(query, [
        userId,
        name,
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
  getUserByPhoneNumber: async (phoneNumber, transaction) => {
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
        { name: "", phone_number: phoneNumber },
        transaction
      );

      // Return the newly created user
      return newUser;
    }
  },
};

module.exports = userQueries;
