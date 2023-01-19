var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var inventoryRouter = require("./routes/inventory");
const mongoose = require("mongoose");
var Item = require("./models/item");
var Category = require("./models/category");
var app = express();
const mongoDB =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/inventory";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/inventory", express.static(path.join(__dirname, "public")));
app.use("/inventory/item", express.static(path.join(__dirname, "public")));
app.use("/inventory/category", express.static(path.join(__dirname, "public")));
app.use(
  "/inventory/category/new/",
  express.static(path.join(__dirname, "public"))
);
app.use("/", indexRouter);
app.use("/inventory", inventoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
