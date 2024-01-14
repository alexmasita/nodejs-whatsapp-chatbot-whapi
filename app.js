const express = require("express");
// const ejs = require("ejs");
// const pgp = require("pg-promise")();
const db = require("./db"); // Adjust the path accordingly

const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Use the express.static middleware to serve static files (css, images, etc.)
app.use(express.static("public"));

// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up your routes
const routes = require("./routes");
app.use("/", routes);

process.on("SIGINT", () => {
  db.closeDatabase();
  process.exit();
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});
