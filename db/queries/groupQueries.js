// const pgp = require("pg-promise")();
// const db = pgp(process.env.DATABASE_URL);
const { dbInstance: db } = require("../../db");
const ensureTableSchema = require("../../utils/ensureTableSchema"); // Adjust the path based on your actual structure
const userQueries = require("./userQueries");
const userRolesQueries = require("./userRolesQueries");

const groupQueries = {
  // Call ensureTableSchema before any CRUD operations
  ensureGroupTableSchema: async () => {
    console.log("ensureGroupTableSchema called");
    const tableName = "groups";
    const columnDataTypes = {
      id: "serial",
      your_user_id: "integer references users(id)",
      recipient_phone_number: "varchar(15)",
      description: "varchar(255)",
      chat_id: "varchar(255)",
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

  // SQL query to create a new group
  createGroup: async (groupData, sessionUser) => {
    return db.tx(async (transaction) => {
      // Update user information
      const user = await userQueries.updateUser(
        sessionUser.id,
        {
          name: groupData.your_name,
          phone_number: groupData.your_phone_number,
        },
        transaction
      );

      console.log("your_user_id: user.id", user.id);
      // Strip non-numeric characters and spaces from the recipient_phone_number
      const strippedRecipientPhoneNumber =
        groupData.recipient_phone_number.replace(/[\D\s]/g, "");

      const group = await transaction.one(
        "INSERT INTO groups (your_user_id, recipient_phone_number, description, chat_id) VALUES (${your_user_id}, ${recipient_phone_number}, ${description}, ${chat_id}) RETURNING *",
        {
          your_user_id: user.id,
          ...groupData,
          recipient_phone_number: strippedRecipientPhoneNumber,
        }
      );

      console.log("group_id: group.id", group.id);

      await userRolesQueries.createUserRole(
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
        users.phone_number AS your_phone_number,
        user_roles.role
      FROM
        groups
        JOIN users ON groups.your_user_id = users.id
        LEFT JOIN user_roles ON groups.id = user_roles.group_id
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
      users.phone_number AS your_phone_number,
      user_roles.role
    FROM
      groups
      LEFT JOIN users ON groups.your_user_id = users.id
      LEFT JOIN user_roles ON groups.id = user_roles.group_id
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
    return db.tx(async (transaction) => {
      // Update user information
      const user = await userQueries.updateUser(
        updatedData.your_user_id,
        {
          name: updatedData.your_name,
          phone_number: updatedData.your_phone_number,
        },
        transaction
      );

      // Strip non-numeric characters and spaces from the recipient phone number
      const strippedRecipientPhoneNumber =
        updatedData.recipient_phone_number.replace(/[\D\s]/g, "");

      // Update group information
      const group = await transaction.one(
        "UPDATE groups SET your_user_id = $2, recipient_phone_number = $3, description = $4, chat_id = $5 WHERE id = $1 RETURNING *",
        [
          groupId,
          user.id,
          strippedRecipientPhoneNumber,
          updatedData.description,
          updatedData.chat_id,
        ]
      );

      // Update user role information
      await userRolesQueries.updateUserRole(
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
