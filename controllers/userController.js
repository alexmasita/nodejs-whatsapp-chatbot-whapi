// controllers/userController.js
const userQueries = require("../db/queries/userQueries");
const path = require("path");

const userController = {
  // Render form to create a new user
  getCreateUser: (req, res) => {
    res.render(path.join(__dirname, "..", "views", "user", "createUser"));
  },

  // Handle submission of the create user form
  postCreateUser: async (req, res) => {
    try {
      // Get form data from the request body
      const { name, id_number, international_code, phone_number } = req.body;

      // Validate the form data (you may add more validation as needed)

      // Insert the user into the database
      const newUser = await userQueries.createUser({
        name,
        id_number,
        international_code,
        phone_number,
      });

      // Redirect to the view all users page after creation
      res.redirect("/users/view");
    } catch (error) {
      console.error("Error handling create user form submission:", error);
      // Handle the error appropriately, e.g., render an error page or redirect to the form page with an error message
      res.status(500).send("Internal Server Error");
    }
  },

  // Render form to update a user
  getUpdateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userQueries.getUserById(userId);
      res.render(path.join(__dirname, "..", "views", "user", "updateUser"), {
        user,
      });
    } catch (error) {
      console.error("Error fetching user details for update:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Handle submission of the update user form
  postUpdateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const updatedData = req.body;

      // Perform the database update using the updateUser query
      const updatedUser = await userQueries.updateUser(userId, updatedData);

      // Redirect to the view all users page after update
      res.redirect("/users/view");
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Render a page to view all users
  viewAllUsers: async (req, res) => {
    console.log("viewAllUsers");
    const users = await userQueries.getAllUsers();
    console.log(users);
    res.render(path.join(__dirname, "..", "views", "user", "viewUsers"), {
      users,
    });
  },

  // Render form to delete a user
  getDeleteUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await userQueries.getUserById(userId);
      res.render(path.join(__dirname, "..", "views", "user", "deleteUser"), {
        user,
      });
    } catch (error) {
      console.error("Error fetching user details for deletion:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Handle submission of the delete user form
  postDeleteUser: async (req, res) => {
    try {
      const userId = req.params.id;

      // Perform the database deletion using the deleteUser query
      await userQueries.deleteUser(userId);

      // Redirect to the view all users page after deletion
      res.redirect("/users/view");
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = userController;
