// middlewares/authMiddleware.js
const authUtils = require("../utils/authUtils");

// const authenticate = (req, res, next) => {
//   const user = req.user;

//   // Check if the user is authenticated
//   if (!user) {
//     // Redirect to the login route if not authenticated
//     return res.redirect("/login");
//   }

//   // Pass the authenticated user to the route handler
//   req.user = user;
//   next();
// };

const isAuthenticated = (req, res, next) => {
  console.log("req.isAuthenticated");
  console.log(req.isAuthenticated);

  if (req.isAuthenticated()) {
    return next(); // Continue to the next middleware or route handler
  }
  res.redirect("/auth/login"); // Redirect to the login page if not authenticated
};

module.exports = { isAuthenticated };
