// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticationService = require("../utils/authenticationService");
const passport = require("passport");
const authQueries = require("../db/queries/authQueries");
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

  // Remove non-numeric characters and spaces from the formatted phone number
  const strippedInternationalCode = phoneNumberUtils.sanitizeInternationalCode(
    req.body.internationalCode
  );
  // Remove non-numeric characters and spaces from the formatted phone number
  const strippedPhoneNumber = phoneNumberUtils.sanitizePhoneNumber(
    req.body.phoneNumber
  );
  let fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
    strippedInternationalCode,
    strippedPhoneNumber
  );
  console.log("fullPhoneNumber - phoneNumberUtils.concatenatePhoneNumber");
  console.log(fullPhoneNumber);
  console.log("whatsapp-verification local strategy entered");
  const { success, message, verificationCode } =
    await authenticationService.sendVerificationCode(fullPhoneNumber, req);

  req.session.user = {
    internationalCode: strippedInternationalCode,
    phoneNumber: strippedPhoneNumber,
    fullPhoneNumber,
    verificationCode,
  };

  console.log("set: req.session.user");
  console.log(req.session.user);

  res.redirect("/auth/whatsApp");
});

// router.get("/verify", (req, res) => {
//   // Render the verification page
//   console.log("req.session.user = /verify");
//   console.log(req.session.user);
//   console.log(req.session.user.fullPhoneNumber);
//   res.render("verify", { phoneNumber: req.session.user.fullPhoneNumber });
// });

router.get("/whatsApp", (req, res) => {
  // Render the verification page
  console.log("req.session.user = /verify");
  console.log(req.session.user);
  console.log(req.session.user.fullPhoneNumber);
  if (!req.session.user.fullPhoneNumber) {
    return res.redirect("/auth/login");
  }
  res.render("whatsApp");
});

// Triggers authentication using query parameters
router.get("/validate", (req, res) => {
  // Redirect to login if credentials are not present
  console.log("req.query.code");
  console.log(req.query.code);
  console.log("req.session.user.fullPhoneNumber");
  console.log(req.session.user.fullPhoneNumber);
  //req.query.phoneNumber = req.session.user.fullPhoneNumber;
  req.query.phoneNumber = req.session.user.phoneNumber;

  if (!req.query.code || !req.query.phoneNumber) {
    return res.redirect("/auth/login");
  }

  // Call passport.authenticate only if credentials are present
  passport.authenticate("local", {
    successReturnToOrRedirect: "/groups/view",
    failureRedirect: "/auth/login",
    failureMessage: true,
  })(req, res);
});

//temporary disable.
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
