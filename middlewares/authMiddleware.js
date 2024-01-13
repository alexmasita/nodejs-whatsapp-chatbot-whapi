// middlewares/authMiddleware.js
const authUtils = require("../utils/authUtils");

const authenticate = (req, res, next) => {
  const user = req.user;

  // Check if the user is authenticated
  if (!user) {
    // Redirect to the login route if not authenticated
    return res.redirect("/login");
  }

  // Pass the authenticated user to the route handler
  req.user = user;
  next();
};

module.exports = { authenticate };
