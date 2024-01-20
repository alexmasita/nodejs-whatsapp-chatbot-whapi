// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticationService = require("../utils/authenticationService");
const passport = require("passport");
const verificationQueries = require("../db/queries/verificationQueries");
const authMiddleware = require("../middlewares/authMiddleware");
const phoneNumberUtils = require("../utils/phoneNumberUtils");

//router.get("/allowed-phone-numbers", authController.getAllowedPhoneNumbers);
// Route to display the login form
router.get("/login", (req, res) => {
  res.render("login");
});

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successReturnToOrRedirect: "/auth/verify",
//     failureRedirect: "/auth/login",
//     failureMessage: true,
//   })
// );

router.post("/login", async function (req, res) {
  console.log("/login entered");
  console.log("req.body.internationalCode, ", req.body.internationalCode);
  console.log("req.body.phoneNumber, ", req.body.phoneNumber);
  let internationalCode = req.body.internationalCode;
  let phoneNumber = req.body.phoneNumber;
  let fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
    internationalCode,
    phoneNumber
  );
  console.log("whatsapp-verification local strategy entered");
  const { success, message, verificationCode } =
    await authenticationService.sendVerificationCode(fullPhoneNumber);
  req.session.user = { fullPhoneNumber, verificationCode };
  res.redirect("/auth/verify");
});

router.get("/verify", (req, res) => {
  // Render the verification page
  console.log("req.session.user = /verify");
  console.log(req.session.user);
  console.log(req.session.user.fullPhoneNumber);
  res.render("verify", { phoneNumber: req.session.user.fullPhoneNumber });
});

router.post(
  "/verify",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/groups/view",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })
);

router.get("/dashboard", authMiddleware.isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
