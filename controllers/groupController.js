// controllers/groupController.js
const groupQueries = require("../db/queries/groupQueries");
const db = require("../db"); // Replace with the path to your db configuration file
const path = require("path");

const groupController = {
  // Implementation for listing all groups using groupQueries.listGroups
  //   listGroups: async (req, res) => {
  //     try {
  //       const groups = await groupQueries.listGroups();
  //       res.render("groupList", { groups, user: req.user });
  //     } catch (error) {
  //       console.error("Error listing groups:", error);
  //       res.status(500).send("Internal Server Error");
  //     }
  //   },

  // Implementation for showing the edit form for a group
  //   showEditForm: async (req, res) => {
  //     try {
  //       const groupId = req.params.groupId;
  //       const group = await groupQueries.getGroupById(groupId);
  //       res.render("groupEditForm", { group, user: req.user });
  //     } catch (error) {
  //       console.error("Error showing edit group form:", error);
  //       res.status(500).send("Internal Server Error");
  //     }
  //   },

  // Implementation for editing a group using groupQueries.editGroup
  //   editGroup: async (req, res) => {
  //     try {
  //       const groupId = req.params.groupId;
  //       const updatedData = req.body;
  //       const updatedGroup = await groupQueries.editGroup(groupId, updatedData);
  //       res.redirect("/groups");
  //     } catch (error) {
  //       console.error("Error editing group:", error);
  //       res.status(500).send("Internal Server Error");
  //     }
  //   },

  // Render form to create a new group
  getCreateGroup: (req, res) => {
    //res.render("/group/createGroup");
    res.render(path.join(__dirname, "..", "views", "group", "createGroup"));
  },

  // Handle submission of the create group form
  postCreateGroup: async (req, res) => {
    try {
      // Get form data from the request body
      const {
        your_name,
        your_phone_number,
        recipient_phone_number,
        description,
        chat_id,
      } = req.body;

      // Validate the form data (you may add more validation as needed)

      // Insert the group into the database
      const newGroup = await groupQueries.createGroup({
        your_name,
        your_phone_number,
        recipient_phone_number,
        description,
        chat_id,
      });

      // Redirect to the view all groups page after creation
      res.redirect("/groups/view");
    } catch (error) {
      console.error("Error handling create group form submission:", error);

      // Handle the error appropriately, e.g., render an error page or redirect to the form page with an error message
      res.status(500).send("Internal Server Error");
    }
  },

  // Render a page to view all groups
  viewAllGroups: async (req, res) => {
    const groups = await db.query(groupQueries.getAllGroups);
    // res.render("/group/viewGroups", { groups });
    res.render(path.join(__dirname, "..", "views", "group", "viewGroups"), {
      groups,
    });
  },

  // Render form to update a group
  getUpdateGroup: async (req, res) => {
    // Implement the logic to fetch group details based on the ID
    // ...

    //res.render("/group/updateGroup", { group });
    res.render(path.join(__dirname, "..", "views", "group", "updateGroup"), {
      group,
    });
  },

  // Handle submission of the update group form
  postUpdateGroup: async (req, res) => {
    // Implement the logic to handle form submission and database update
    // ...

    // Redirect to the view all groups page after update
    res.redirect("/groups/view");
  },

  // Render form to delete a group
  getDeleteGroup: async (req, res) => {
    // Implement the logic to fetch group details based on the ID

    //res.render("deleteGroup", { group });
    res.render(path.join(__dirname, "..", "views", "group", "deleteGroup"), {
      group,
    });
  },

  // Handle submission of the delete group form
  postDeleteGroup: async (req, res) => {
    // Implement the logic to handle form submission and database deletion
    // ...

    // Redirect to the view all groups page after deletion
    //res.redirect("/group/viewGroups");
    res.redirect("/groups/view");
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
