// const pgp = require("pg-promise")();
// const db = pgp(process.env.DATABASE_URL);
const { dbInstance: db } = require("../../db");
const ensureTableSchema = require("../../utils/ensureTableSchema"); // Adjust the path based on your actual structure

const groupQueries = {
  //   // SQL query to list all groups
  //   listGroups: () => {
  //     return db.any("SELECT * FROM groups");
  //   },
  //   // SQL query to get a group by ID
  //   getGroupById: (groupId) => {
  //     return db.oneOrNone("SELECT * FROM groups WHERE id = $1", groupId);
  //   },
  //   // SQL query to edit a group
  //   editGroup: (groupId, updatedData) => {
  //     return db.one("UPDATE groups SET ${this~^} WHERE id = $1 RETURNING *", [
  //       groupId,
  //       updatedData,
  //     ]);
  //   },

  // Call ensureTableSchema before any CRUD operations
  ensureGroupTableSchema: async () => {
    console.log("ensureGroupTableSchema called");
    const tableName = "groups";
    const columnDataTypes = {
      id: "serial",
      your_name: "varchar(255)",
      your_phone_number: "varchar(15)",
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
  createGroup: async (groupData) => {
    // Call ensureTableSchema before creating a group
    //await groupQueries.ensureGroupTableSchema();

    return db.one(
      "INSERT INTO groups (your_name, your_phone_number, recipient_phone_number, description, chat_id) VALUES (${your_name}, ${your_phone_number}, ${recipient_phone_number}, ${description}, ${chat_id}) RETURNING *",
      groupData
    );
  },

  // SQL query to list all groups
  getAllGroups: async () => {
    // Call ensureTableSchema before fetching all groups
    //await groupQueries.ensureGroupTableSchema();

    return db.any("SELECT * FROM groups WHERE is_deleted = false");
  },

  // SQL query to get a group by ID
  getGroupById: async (groupId) => {
    // Call ensureTableSchema before fetching a group by ID
    // await groupQueries.ensureGroupTableSchema();

    return db.oneOrNone(
      "SELECT * FROM groups WHERE id = $1 AND is_deleted = false",
      groupId
    );
  },

  // SQL query to update a group
  updateGroup: async (groupId, updatedData) => {
    // Call ensureTableSchema before updating a group
    // await groupQueries.ensureGroupTableSchema();

    return db.one(
      "UPDATE groups SET your_name = ${your_name}, your_phone_number = ${your_phone_number}, recipient_phone_number = ${recipient_phone_number}, description = ${description}, chat_id = ${chat_id} WHERE id = $1 RETURNING *",
      [groupId, updatedData]
    );
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
