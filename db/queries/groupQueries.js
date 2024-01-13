const db = require("../../db");

const groupQueries = {
  // SQL query to list all groups
  listGroups: () => {
    return db.any("SELECT * FROM groups");
  },
  // SQL query to get a group by ID
  getGroupById: (groupId) => {
    return db.oneOrNone("SELECT * FROM groups WHERE id = $1", groupId);
  },
  // SQL query to edit a group
  editGroup: (groupId, updatedData) => {
    return db.one("UPDATE groups SET ${this~^} WHERE id = $1 RETURNING *", [
      groupId,
      updatedData,
    ]);
  },
};

module.exports = groupQueries;
