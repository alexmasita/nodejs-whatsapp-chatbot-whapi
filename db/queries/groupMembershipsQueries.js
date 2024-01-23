const { dbInstance: db } = require("..");

const groupMembershipsQueries = {
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
