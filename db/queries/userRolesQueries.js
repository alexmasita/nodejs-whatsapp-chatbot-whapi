const { dbInstance: db } = require("../../db");
const ensureTableSchema = require("../../utils/ensureTableSchema");

const userRolesQueries = {
  ensureUserRolesTableSchema: async () => {
    console.log("ensureUserRolesTableSchema called");
    const tableName = "user_roles";
    const columnDataTypes = {
      id: "serial",
      user_id: "integer references users(id)",
      group_id: "integer references groups(id)",
      role: "varchar(50) default 'donor'",
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

  createUserRole: async (userRoleData, transaction) => {
    // Call ensureTableSchema before creating a user role
    //await userRolesQueries.ensureUserRolesTableSchema();

    const query =
      "INSERT INTO user_roles (user_id, group_id, role) VALUES (${user_id}, ${group_id}, ${role}) RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.one(query, userRoleData);
    } else {
      // Execute the query without a transaction
      return db.one(query, userRoleData);
    }
  },
  updateUserRole: async (userRoleData, transaction) => {
    // Call ensureTableSchema before updating a user role
    //await userRolesQueries.ensureUserRolesTableSchema();

    const query =
      "UPDATE user_roles SET role = ${role} WHERE user_id = ${user_id} AND group_id = ${group_id} RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.oneOrNone(query, userRoleData);
    } else {
      // Execute the query without a transaction
      return db.oneOrNone(query, userRoleData);
    }
  },
  deleteUserRole: async (userRoleData, transaction) => {
    // Call ensureTableSchema before deleting a user role
    //await userRolesQueries.ensureUserRolesTableSchema();

    const query =
      "DELETE FROM user_roles WHERE user_id = ${user_id} AND group_id = ${group_id} RETURNING *";

    if (transaction) {
      // Use the provided transaction object
      return transaction.oneOrNone(query, userRoleData);
    } else {
      // Execute the query without a transaction
      return db.oneOrNone(query, userRoleData);
    }
  },
};

module.exports = userRolesQueries;
