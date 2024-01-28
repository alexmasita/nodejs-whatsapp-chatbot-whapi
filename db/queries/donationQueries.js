const { dbInstance: db } = require("../../db");
const phoneNumberUtils = require("../../utils/phoneNumberUtils");
const userQueries = require("./userQueries");

const calculateTotalAmount = async (groupId, transaction) => {
  const totalAmountQuery =
    "SELECT COALESCE(SUM(amount), 0) FROM donations WHERE group_id = $1 AND is_deleted = false";
  const totalAmount = await (transaction || db).one(totalAmountQuery, groupId);

  return totalAmount.coalesce;
};

const donationQueries = {
  getAllDonationsByGroup: async (groupId, transaction) => {
    return (transaction || db).tx(async (trans) => {
      const donations = await trans.any(
        `
        SELECT
          *
        FROM
          donations
        WHERE
          donations.group_id = $1 AND donations.is_deleted = false
        ORDER BY donations.donation_date DESC
      `,
        groupId
      );

      // Calculate total amount
      const totalAmount = await calculateTotalAmount(groupId, trans);

      return { donations, totalAmount };
    });
  },

  createDonation: async (donationData, groupId) => {
    return db.tx(async (transaction) => {
      // ... existing code ...
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          donationData.international_code
        );
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        donationData.phone_number
      );

      // // Update user information
      // const existingUser = await userQueries.getUserByPhoneNumber(
      //   strippedInternationalCode,
      //   strippedPhoneNumber,
      //   transaction
      // );

      // const user = existingUser
      //   ? await userQueries.updateUser(
      //       existingUser.id,
      //       {
      //         name: donationData.name,
      //         international_code: strippedInternationalCode,
      //         phone_number: strippedPhoneNumber, // Use the stripped phone number
      //       },
      //       transaction
      //     )
      //   : await userQueries.createUser(
      //       {
      //         name: donationData.name,
      //         international_code: strippedInternationalCode,
      //         phone_number: strippedPhoneNumber, // Use the stripped phone number
      //       },
      //       transaction
      //     );

      // CREATE TABLE donations (
      //   id SERIAL PRIMARY KEY,
      //   name VARCHAR(255),
      //   id_number VARCHAR(255),
      //   international_code VARCHAR(15),
      //   phone_number VARCHAR(15) UNIQUE,
      //   group_id INTEGER REFERENCES groups(id),
      //   amount DECIMAL,
      //   donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      //   is_deleted BOOLEAN DEFAULT false
      // );

      const donation = await transaction.one(
        "INSERT INTO donations (name, id_number, international_code, phone_number, group_id, amount, donation_date) VALUES (${name}, ${id_number}, ${international_code}, ${phone_number}, ${group_id}, ${amount}, CURRENT_TIMESTAMP) RETURNING *",
        {
          name: donationData.name,
          id_number: donationData.id_number,
          international_code: donationData.international_code,
          phone_number: donationData.phone_number,
          group_id: groupId,
          amount: donationData.amount,
        }
      );

      // Calculate total amount
      const totalAmount = await calculateTotalAmount(groupId, transaction);

      return { donation, totalAmount };
    });
  },

  // createDonation: async (donationData, sessionUser, groupId) => {
  //   return db.tx(async (transaction) => {
  //     // Remove non-numeric characters and spaces from the formatted phone number
  //     const strippedInternationalCode =
  //       phoneNumberUtils.sanitizeInternationalCode(
  //         donationData.international_code
  //       );
  //     // Remove non-numeric characters and spaces from the formatted phone number
  //     const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
  //       donationData.phone_number
  //     );

  //     // Update user information
  //     const existingUser = await userQueries.getUserByPhoneNumber(
  //       strippedInternationalCode,
  //       strippedPhoneNumber,
  //       transaction
  //     );

  //     const user = existingUser
  //       ? await userQueries.updateUser(
  //           existingUser.id,
  //           {
  //             name: donationData.name,
  //             international_code: strippedInternationalCode,
  //             phone_number: strippedPhoneNumber, // Use the stripped phone number
  //           },
  //           transaction
  //         )
  //       : await userQueries.createUser(
  //           {
  //             name: donationData.name,
  //             international_code: strippedInternationalCode,
  //             phone_number: strippedPhoneNumber, // Use the stripped phone number
  //           },
  //           transaction
  //         );

  //     const donation = await transaction.one(
  //       "INSERT INTO donations (user_id, group_id, amount, donation_date) VALUES (${user_id}, ${group_id}, ${amount}, CURRENT_TIMESTAMP) RETURNING *",
  //       {
  //         user_id: user.id,
  //         group_id: groupId,
  //         amount: donationData.amount,
  //       }
  //     );
  //     return donation;
  //   });
  // },

  // getAllDonationsByGroup: async (groupId) => {
  //   return db.any(
  //     `
  //     SELECT
  //       donations.*,
  //       users.name AS donor_name,
  //       users.international_code AS donor_international_code,
  //       users.phone_number AS donor_phone_number
  //     FROM
  //       donations
  //       JOIN users ON donations.user_id = users.id
  //     WHERE
  //       donations.group_id = $1 AND donations.is_deleted = false
  //   `,
  //     groupId
  //   );
  // },

  getDonationById: async (donationId) => {
    // Call ensureTableSchema before fetching a donation by ID
    // await donationQueries.ensureDonationTableSchema();

    return db.oneOrNone(
      `
      SELECT
        *
      FROM
        donations
      WHERE
        donations.id = $1 AND donations.is_deleted = false
    `,
      donationId
    );
  },

  updateDonation: async (donationId, updatedData) => {
    return db.tx(async (transaction) => {
      // Concatenate international code and phone number
      // const fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
      //   updatedData.internationalCode,
      //   updatedData.phone_number
      // );

      // // Update user information
      // const existingUser = await userQueries.getUserByPhoneNumber(
      //   updatedData.international_code,
      //   updatedData.phone_number,
      //   transaction
      // );
      // Remove non-numeric characters and spaces
      // const strippedInternationalCode =
      //   phoneNumberUtils.sanitizeInternationalCode(
      //     updatedData.international_code
      //   );
      // // Remove leading zeros, non-numeric characters and spaces
      // const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
      //   updatedData.phone_number
      // );

      // const user = existingUser
      //   ? await userQueries.updateUser(
      //       existingUser.id,
      //       {
      //         name: updatedData.name,
      //         international_code: strippedInternationalCode,
      //         phone_number: strippedPhoneNumber, // Use the stripped phone number
      //       },
      //       transaction
      //     )
      //   : await userQueries.createUser(
      //       {
      //         name: updatedData.name,
      //         international_code: strippedInternationalCode,
      //         phone_number: strippedPhoneNumber, // Use the stripped phone number
      //       },
      //       transaction
      //     );

      // CREATE TABLE donations (
      //   id SERIAL PRIMARY KEY,
      //   name VARCHAR(255),
      //   id_number VARCHAR(255),
      //   international_code VARCHAR(15),
      //   phone_number VARCHAR(15) UNIQUE,
      //   group_id INTEGER REFERENCES groups(id),
      //   amount DECIMAL,
      //   donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      //   is_deleted BOOLEAN DEFAULT false
      // );
      const donation = await transaction.one(
        "UPDATE donations SET name = $2, id_number = $3, international_code = $4, phone_number = $5, amount = $6 WHERE id = $1 RETURNING *",
        [
          donationId,
          updatedData.name,
          updatedData.id_number,
          updatedData.international_code,
          updatedData.phone_number,
          updatedData.amount,
        ]
      );

      return donation;
    });
  },

  deleteDonation: async (donationId) => {
    // Call ensureTableSchema before deleting a donation
    // await donationQueries.ensureDonationTableSchema();

    return db.none(
      "UPDATE donations SET is_deleted = true WHERE id = $1",
      donationId
    );
  },
};

module.exports = donationQueries;
