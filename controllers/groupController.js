// controllers/groupController.js
const groupQueries = require("../db/queries/groupQueries");
const db = require("../db"); // Replace with the path to your db configuration file
const path = require("path");

const groupController = {
  // Render form to create a new group
  getCreateGroup: (req, res) => {
    //res.render("/group/createGroup");
    console.log("getCreateGroup - req.user");
    console.log(req.user);
    res.render(path.join(__dirname, "..", "views", "group", "createGroup"), {
      user: req.user,
    });
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
      const newGroup = await groupQueries.createGroup(
        {
          your_name,
          your_phone_number,
          recipient_phone_number,
          description,
          chat_id,
        },
        req.user
      );

      // Redirect to the view all groups page after creation
      res.redirect("/groups/view");
    } catch (error) {
      console.error("Error handling create group form submission:", error);

      // Handle the error appropriately, e.g., render an error page or redirect to the form page with an error message
      res.status(500).send("Internal Server Error");
    }
  },

  // Render form to update a group
  getUpdateGroup: async (req, res) => {
    try {
      const groupId = req.params.id;
      console.log("get groupId");
      console.log(groupId);

      const group = await groupQueries.getGroupById(groupId);
      // req.session.groupData = {
      //   your_user_id: group.your_user_id,
      // };

      res.render(path.join(__dirname, "..", "views", "group", "updateGroup"), {
        group,
      });
    } catch (error) {
      console.error("Error fetching group details for update:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // Handle submission of the update group form
  postUpdateGroup: async (req, res) => {
    try {
      const groupId = req.params.id;
      const updatedData = req.body;
      console.log("get groupId");
      console.log(groupId);
      console.log("group - req.user.id");
      console.log(req.user.id);

      // Retrieve data from session storage
      const groupData = {
        your_user_id: req.user.id,
      };
      // Combine the data
      const dataToSubmit = {
        ...updatedData,
        ...groupData,
      };
      // Perform the database update using the updateGroup query
      const updatedGroup = await groupQueries.updateGroup(
        groupId,
        dataToSubmit
      );

      // Clear session storage after use if needed
      //delete req.session.groupData;

      // Redirect to the view all groups page after update
      res.redirect("/groups/view");
    } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Render a page to view all groups
  viewAllGroups: async (req, res) => {
    const groups = await groupQueries.getAllGroups();
    // res.render("/group/viewGroups", { groups });
    console.log("groups object, ", groups);
    console.log("req.user in viewAllGroups", req.user);
    res.render(path.join(__dirname, "..", "views", "group", "viewGroups"), {
      groups,
      user: req.user,
    });
  },

  // Render form to delete a group
  getDeleteGroup: async (req, res) => {
    try {
      const groupId = req.params.id;
      const group = await groupQueries.getGroupById(groupId);

      res.render(path.join(__dirname, "..", "views", "group", "deleteGroup"), {
        group,
      });
    } catch (error) {
      console.error("Error fetching group details for deletion:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Handle submission of the delete group form
  postDeleteGroup: async (req, res) => {
    try {
      const groupId = req.params.id;

      // Perform the database deletion using the deleteGroup query
      await groupQueries.deleteGroup(groupId);

      // Redirect to the view all groups page after deletion
      res.redirect("/groups/view");
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  // Implementation for adding an admin to a group by phone number
  addAdminToGroupByPhoneNumber: async (req, res) => {
    const groupId = req.params.id;
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
    const groupId = req.params.id;
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
