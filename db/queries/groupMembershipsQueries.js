const { dbInstance: db } = require("..");
const ensureTableSchema = require("../../utils/ensureTableSchema");

const groupMembershipsQueries = {
  ensureGroupMembershipsTableSchema: async () => {
    console.log("ensureGroupMembershipsTableSchema called");
    const tableName = "group_memberships";
    const columnDataTypes = {
      id: "serial",
      user_id: "integer references users(id)",
      group_id: "integer references groups(id)",
      role: "varchar(50) default 'admin'",
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

  createGroupMembership: async (groupMembershipData, transaction) => {
    // Call ensureTableSchema before creating a user role
    //await groupMembershipsQueries.ensureGroupMembershipsTableSchema();

    const query =
      "INSERT INTO group_memberships (user_id, group_id, role) VALUES (${user_id}, ${group_id}, ${role}) RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, groupMembershipData);
    } else {
      // Execute the query without a transaction
      return db.one(query, groupMembershipData);
    }
  },
  updateGroupMembership: async (groupMembershipData, transaction) => {
    // Call ensureTableSchema before updating a user role
    //await groupMembershipsQueries.ensureGroupMembershipsTableSchema();

    const query =
      "UPDATE group_memberships SET role = ${role} WHERE user_id = ${user_id} AND group_id = ${group_id} RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.oneOrNone(query, groupMembershipData);
    } else {
      // Execute the query without a transaction
      return db.oneOrNone(query, groupMembershipData);
    }
  },
  deleteGroupMembership: async (groupMembershipData, transaction) => {
    // Call ensureTableSchema before deleting a user role
    //await groupMembershipsQueries.ensureGroupMembershipsTableSchema();

    const query =
      "DELETE FROM group_memberships WHERE user_id = ${user_id} AND group_id = ${group_id} RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.oneOrNone(query, groupMembershipData);
    } else {
      // Execute the query without a transaction
      return db.oneOrNone(query, groupMembershipData);
    }
  },
};

module.exports = groupMembershipsQueries;
