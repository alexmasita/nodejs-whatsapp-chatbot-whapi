// const pgp = require("pg-promise")();
// const db = pgp(process.env.DATABASE_URL);
const { dbInstance: db } = require("../../db");
const userQueries = require("./userQueries");
const groupMembershipsQueries = require("./groupMembershipsQueries");
const phoneNumberUtils = require("../../utils/phoneNumberUtils");

const groupQueries = {
  // SQL query to create a new group
  createGroup: async (groupData, sessionUser) => {
    return db.tx(async (transaction) => {
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedYourInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          groupData.your_international_code
        );
      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedYourPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        groupData.your_phone_number
      );

      // Update user information
      const user = await userQueries.updateUser(
        sessionUser.id,
        {
          name: groupData.your_name,
          international_code: strippedYourInternationalCode || 254,
          phone_number: strippedYourPhoneNumber,
        },
        transaction
      );

      console.log("your_user_id: user.id", user.id);
      // Strip leading zeros, non-numeric characters and spaces from the recipient_phone_number
      const strippedRecipientInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          groupData.recipient_international_code
        );
      const strippedRecipientPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        groupData.recipient_phone_number
      );

      const group = await transaction.one(
        "INSERT INTO groups (your_user_id, recipient_international_code, recipient_phone_number, description, chat_id) VALUES (${your_user_id}, ${recipient_international_code}, ${recipient_phone_number}, ${description}, ${chat_id}) RETURNING *",
        {
          your_user_id: user.id,
          ...groupData,
          recipient_international_code:
            strippedRecipientInternationalCode || 254,
          recipient_phone_number: strippedRecipientPhoneNumber,
        }
      );

      console.log("group_id: group.id", group.id);

      await groupMembershipsQueries.createGroupMembership(
        {
          user_id: user.id,
          group_id: group.id,
          role: "admin", // Set the default role as needed
        },
        transaction
      ); // Pass the transaction object

      return group;
    });
  },

  // SQL query to list all groups
  getAllGroups: async () => {
    // Call ensureTableSchema before fetching all groups
    //await groupQueries.ensureGroupTableSchema();

    return db.any(`
      SELECT
        groups.*,
        users.name AS your_name,
        users.international_code AS your_international_code,
        users.phone_number AS your_phone_number,
        group_memberships.role
      FROM
        groups
        JOIN users ON groups.your_user_id = users.id
        LEFT JOIN group_memberships ON groups.id = group_memberships.group_id
      WHERE
        groups.is_deleted = false
    `);
  },

  // SQL query to get a group by ID
  getGroupById: async (groupId) => {
    // Call ensureTableSchema before fetching a group by ID
    // await groupQueries.ensureGroupTableSchema();

    return db.oneOrNone(
      `
    SELECT
      groups.*,
      users.name AS your_name,
      users.international_code AS your_international_code,
      users.phone_number AS your_phone_number,
      group_memberships.role
    FROM
      groups
      LEFT JOIN users ON groups.your_user_id = users.id
      LEFT JOIN group_memberships ON groups.id = group_memberships.group_id
    WHERE
      groups.id = $1 AND groups.is_deleted = false
  `,
      groupId
    );
  },

  // SQL query to update a group
  updateGroup: async (groupId, updatedData) => {
    console.log("updatedData.your_user_id", updatedData.your_user_id);
    console.log("updatedData");
    console.log(updatedData);

    // Remove non-numeric characters and spaces from the formatted phone number
    const strippedYourInternationalCode =
      phoneNumberUtils.sanitizeInternationalCode(
        updatedData.your_international_code
      );
    // Remove leading zeros, non-numeric characters and spaces from the formatted phone number
    const strippedYourPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
      updatedData.your_phone_number
    );
    return db.tx(async (transaction) => {
      // Update user information
      const user = await userQueries.updateUser(
        updatedData.your_user_id,
        {
          name: updatedData.your_name,
          international_code: strippedYourInternationalCode || 254,
          phone_number: strippedYourPhoneNumber,
        },
        transaction
      );

      // Remove non-numeric characters and spaces from the formatted phone number
      const strippedRecipientInternationalCode =
        phoneNumberUtils.sanitizeInternationalCode(
          updatedData.recipient_international_code
        );
      // Strip non-numeric characters and spaces from the recipient phone number
      const strippedRecipientPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
        updatedData.recipient_phone_number
      );

      // Update group information
      const group = await transaction.one(
        "UPDATE groups SET your_user_id = $2, recipient_international_code = $3,recipient_phone_number = $4, description = $5, chat_id = $6 WHERE id = $1 RETURNING *",
        [
          groupId,
          user.id,
          strippedRecipientInternationalCode,
          strippedRecipientPhoneNumber,
          updatedData.description,
          updatedData.chat_id,
        ]
      );

      // Update user role information
      await groupMembershipsQueries.updateGroupMembership(
        {
          user_id: user.id,
          group_id: group.id,
          role: "admin", // Update the role as needed
        },
        transaction
      );

      return group;
    });
  },

  // SQL query to delete a group (soft delete)
  deleteGroup: async (groupId) => {
    // Call ensureTableSchema before deleting a group
    // await groupQueries.ensureGroupTableSchema();

    return db.none(
      "UPDATE groups SET is_deleted = true WHERE id = $1",
      groupId
    );
  },
};

module.exports = groupQueries;
