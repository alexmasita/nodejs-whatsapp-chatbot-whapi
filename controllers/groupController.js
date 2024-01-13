// controllers/groupController.js
const groupQueries = require("../db/queries/groupQueries");
const db = require("../db"); // Replace with the path to your db configuration file

const groupController = {
  // Implementation for listing all groups using groupQueries.listGroups
  listGroups: async (req, res) => {
    try {
      const groups = await groupQueries.listGroups();
      res.render("groupList", { groups, user: req.user });
    } catch (error) {
      console.error("Error listing groups:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Implementation for showing the edit form for a group
  showEditForm: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const group = await groupQueries.getGroupById(groupId);
      res.render("groupEditForm", { group, user: req.user });
    } catch (error) {
      console.error("Error showing edit group form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Implementation for editing a group using groupQueries.editGroup
  editGroup: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const updatedData = req.body;
      const updatedGroup = await groupQueries.editGroup(groupId, updatedData);
      res.redirect("/groups");
    } catch (error) {
      console.error("Error editing group:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Implementation for adding an admin to a group by phone number
  addAdminToGroupByPhoneNumber: async (req, res) => {
    const groupId = req.params.groupId;
    const phoneNumber = req.body.phoneNumber;

    try {
      // Start a transaction
      await db.tx(async (t) => {
        // Find the user ID based on the provided phone number
        let userId = await t.oneOrNone(
          "SELECT id FROM users WHERE phone_number = $1 AND role = $2",
          [phoneNumber, "admin"]
        );

        if (!userId) {
          // If user not found, add a new admin user to the users table
          userId = await t.one(
            "INSERT INTO users(phone_number, role) VALUES($1, $2) RETURNING id",
            [phoneNumber, "admin"]
          );
        }

        // Add the admin user to the user_groups table
        await t.none(
          "INSERT INTO user_groups(user_id, group_id) VALUES($1, $2)",
          [userId, groupId]
        );
      });

      res.redirect(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error adding admin to group:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Implementation for removing an admin from a group
  removeAdminFromGroup: async (req, res) => {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    try {
      // Directly remove the admin user from the user_groups table without a transaction
      await db.none(
        "DELETE FROM user_groups WHERE user_id = $1 AND group_id = $2",
        [userId, groupId]
      );

      res.redirect(`/groups/${groupId}`);
    } catch (error) {
      console.error("Error removing admin from group:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = groupController;
