const express = require("express");
const session = require("express-session");
const { setupTables } = require("./tableSetup");
const passport = require("passport");
const pgSession = require("connect-pg-simple")(session);
const pgp = require("pg-promise")();
const { dbInstance: db, closeDatabase } = require("./db");
const authQueries = require("./db/queries/authQueries");
const authenticationService = require("./utils/authenticationService");
const LocalStrategy = require("passport-local").Strategy;
const phoneNumberUtils = require("./utils/phoneNumberUtils");

passport.use(
  new LocalStrategy(
    {
      usernameField: "phoneNumber",
      passwordField: "code",
      passReqToCallback: true,
    },
    async (req, phoneNumber, code, done) => {
      console.log("whatsapp-verification local strategy entered");
      console.log("phoneNumber ", phoneNumber);
      console.log("code ", code);
      console.log("req - in localStrategy");
      console.log(req);
      // const { success, message, verificationCode } =
      //   await authenticationService.sendVerificationCode(username);
      const fullPhoneNumber = phoneNumberUtils.concatenatePhoneNumber(
        req.session.user.internationalCode,
        phoneNumber
      );

      const storedVerificationCode = await authQueries.getVerificationCode(
        fullPhoneNumber
      );

      console.log("storedVerificationCode", storedVerificationCode);
      console.log("code", code);
      if (code === storedVerificationCode) {
        console.log("localStrategy executed successfully");
        // const user = await authenticationService.getUserByPhoneNumber(
        //   phoneNumber
        // );
        console.log("phoneNumber in done", {
          internationalCode: req.session.user.internationalCode,
          phoneNumber,
          fullPhoneNumber,
        });
        return done(null, {
          internationalCode: req.session.user.internationalCode,
          phoneNumber,
          fullPhoneNumber,
        }); // Successfully sent verification code
      } else {
        return done(null, false, {
          message: "Code verification failed",
        }); // Failed to send verification code
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("phoneNumber in serializeUser", user);
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  console.log("phoneNumber in deserializeUser", user.phoneNumber);
  const fetchedUser = await authenticationService.getUserByPhoneNumber(
    user.internationalCode,
    user.phoneNumber
  );
  console.log("user in deserializeUser", fetchedUser);
  done(null, fetchedUser);
});

const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Use the express.static middleware to serve static files (css, images, etc.)
app.use(express.static("public"));

// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware with Connect-PG-Simple for PostgreSQL session storage
app.use(
  session({
    store: new pgSession({
      pgPromise: db,
      tableName: "sessions",
    }),
    secret: "afrolink_access", // replace with a secure secret
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up your routes
const routes = require("./routes");
app.use("/", routes);

process.on("SIGINT", () => {
  closeDatabase();
  process.exit();
});

// Call the setupTables function before starting the server
setupTables()
  .then(() => {
    // Continue with other setup or start the server
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
      console.log(`Listening on port ${port}...`);
    });
  })
  .catch((error) => {
    console.error("Error setting up tables:", error);
    // Handle errors or exit the application
  });
