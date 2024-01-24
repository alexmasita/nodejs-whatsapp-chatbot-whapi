const donationQueries = require("../db/queries/donationQueries");
const groupQueries = require("../db/queries/groupQueries");
const path = require("path");

const donationController = {
  getCreateDonation: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const group = await groupQueries.getGroupById(groupId);

      // res.render("donationForm", { group });

      res.render(
        path.join(__dirname, "..", "views", "donation", "createDonation"),
        {
          group,
        }
      );
    } catch (error) {
      console.error("Error rendering donation form:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  postCreateDonation: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const donationData = req.body;

      // Validate the form data (add more validation as needed)

      // Insert the donation into the database
      const { donation, totalAmount } = await donationQueries.createDonation(
        donationData,
        req.user,
        groupId
      );

      // Redirect to the view all donations page after creation
      res.redirect(`/donations/view/${groupId}`);
    } catch (error) {
      console.error("Error handling create donation form submission:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getAllDonationsByGroup: async (req, res) => {
    try {
      const groupId = req.params.groupId;

      // Fetch donations for the group
      const { donations, totalAmount } =
        await donationQueries.getAllDonationsByGroup(groupId);

      // Fetch group details including the description
      const groupDetails = await groupQueries.getGroupById(groupId);

      // Pass both donations and group description to the template
      //   res.render("viewDonations", {
      //     donations,
      //     groupDescription: groupDetails.description,
      //   });
      res.render(
        path.join(__dirname, "..", "views", "donation", "viewDonations"),
        {
          donations,
          totalAmount,
          groupDescription: groupDetails.description,
          groupId: groupId,
        }
      );
    } catch (error) {
      console.error("Error fetching donations by group:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getUpdateDonation: async (req, res) => {
    try {
      const donationId = req.params.id;
      const donation = await donationQueries.getDonationById(donationId);

      //   res.render("donationForm", { donation });
      res.render(
        path.join(__dirname, "..", "views", "donation", "updateDonation"),
        {
          donation,
        }
      );
    } catch (error) {
      console.error("Error rendering donation update form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  postUpdateDonation: async (req, res) => {
    try {
      const donationId = req.params.id;
      const updatedData = req.body;

      // Perform the database update using the updateDonation query
      const updatedDonation = await donationQueries.updateDonation(
        donationId,
        updatedData
      );

      // Redirect to the view all donations page after update
      res.redirect(`/donations/view/${updatedDonation.group_id}`);
    } catch (error) {
      console.error("Error updating donation:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getDeleteDonation: async (req, res) => {
    try {
      const donationId = req.params.id;
      const donation = await donationQueries.getDonationById(donationId);

      //   res.render("donationForm", { donation });
      res.render(
        path.join(__dirname, "..", "views", "donation", "deleteDonation"),
        {
          donation,
        }
      );
    } catch (error) {
      console.error("Error rendering donation deletion form:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  postDeleteDonation: async (req, res) => {
    try {
      const donationId = req.params.id;
      const groupId = req.body.group_id;

      // Perform the database deletion using the deleteDonation query
      await donationQueries.deleteDonation(donationId);

      // Redirect to the view all donations page after deletion
      res.redirect(`/donations/view/${groupId}`);
    } catch (error) {
      console.error("Error deleting donation:", error);
      res.status(500).send("Internal Server Error");
    }
  },
};

module.exports = donationController;
