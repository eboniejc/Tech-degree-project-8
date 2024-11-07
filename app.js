const { sequelize } = require("./models"); //Import sequelize from models

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var booksRouter = require("./routes/books");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/books", booksRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Sorry, page not found");
  err.status = 404;
  console.error(`Status: ${err.status}, Message: ${err.message}`); // Log 404 error
  res.render("page-not-found", { title: "Page Not Found", error: err });
});

// Error handler
app.use((err, req, res, next) => {
  err.status = err.status || 500; // Default to 500
  err.message = err.message || "We goofed!";
  console.error(`Status: ${err.status}, Message: ${err.message}`); // Log the error
  res.status(err.status);
  res.render("error", { title: "Error", error: err });
});

//IIFE Sync and authentication
(async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Error syncing the database:", error);
  }

  try {
    await sequelize.authenticate();
    console.log("Database succesfully connected.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = app;
