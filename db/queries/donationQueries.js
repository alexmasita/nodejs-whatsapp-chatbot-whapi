const { dbInstance: db } = require("../../db");
const phoneNumberUtils = require("../../utils/phoneNumberUtils");
const userQueries = require("./userQueries");

const donationQueries = {
  createDonation: async (donationData, sessionUser, groupId) => {
    return db.tx(async (transaction) => {
      // Concatenate internationalCode and phone_number
      // const fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
      //   donationData.international_code,
      //   donationData.phone_number
      // );
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          donationData.international_code
        );
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        donationData.phone_number
      );

      // Update user information
      const existingUser = await userQueries.getUserByPhoneNumber(
        strippedInternationalCode,
        strippedPhoneNumber,
        transaction
      );

      const user = existingUser
        ? await userQueries.updateUser(
            existingUser.id,
            {
              name: donationData.name,
              international_code: strippedInternationalCode,
              phone_number: strippedPhoneNumber, // Use the stripped phone number
            },
            transaction
          )
        : await userQueries.createUser(
            {
              name: donationData.name,
              international_code: strippedInternationalCode,
              phone_number: strippedPhoneNumber, // Use the stripped phone number
            },
            transaction
          );

      const donation = await transaction.one(
        "INSERT INTO donations (user_id, group_id, amount, donation_date) VALUES (${user_id}, ${group_id}, ${amount}, CURRENT_TIMESTAMP) RETURNING *",
        {
          user_id: user.id,
          group_id: groupId,
          amount: donationData.amount,
        }
      );
      return donation;
    });
  },

  getAllDonationsByGroup: async (groupId) => {
    // Call ensureTableSchema before fetching all donations
    //await donationQueries.ensureDonationTableSchema();

    return db.any(
      `
      SELECT
        donations.*,
        users.name AS donor_name,
        users.international_code AS donor_international_code,
        users.phone_number AS donor_phone_number
      FROM
        donations
        JOIN users ON donations.user_id = users.id
      WHERE
        donations.group_id = $1 AND donations.is_deleted = false
    `,
      groupId
    );
  },

  getDonationById: async (donationId) => {
    // Call ensureTableSchema before fetching a donation by ID
    // await donationQueries.ensureDonationTableSchema();

    return db.oneOrNone(
      `
      SELECT
        donations.*,
        users.name AS donor_name,
        users.international_code AS donor_international_code,
        users.phone_number AS donor_phone_number
      FROM
        donations
        JOIN users ON donations.user_id = users.id
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

      // Update user information
      const existingUser = await userQueries.getUserByPhoneNumber(
        updatedData.international_code,
        updatedData.phone_number,
        transaction
      );
      // Remove non-numeric characters and spaces
      const strippedInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          updatedData.international_code
        );
      // Remove leading zeros, non-numeric characters and spaces
      const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        updatedData.phone_number
      );

      const user = existingUser
        ? await userQueries.updateUser(
            existingUser.id,
            {
              name: updatedData.name,
              international_code: strippedInternationalCode,
              phone_number: strippedPhoneNumber, // Use the stripped phone number
            },
            transaction
          )
        : await userQueries.createUser(
            {
              name: updatedData.name,
              international_code: strippedInternationalCode,
              phone_number: strippedPhoneNumber, // Use the stripped phone number
            },
            transaction
          );

      const donation = await transaction.one(
        "UPDATE donations SET user_id = $2, amount = $3 WHERE id = $1 RETURNING *",
        [donationId, user.id, updatedData.amount]
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
