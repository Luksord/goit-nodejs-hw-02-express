const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const app = express();

const mongoose = require("mongoose");
require("dotenv").config();
const mongoURI = process.env.DB_HOST;

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
const contactsRouter = require("./routes/contacts");
const userRouter = require("./routes/users");
const verRouter = require("./routes/users");

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use("/api/contacts", contactsRouter);
app.use("/api/users", userRouter);
app.use("/api/ver", verRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.path}` });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Database connection successful.");
  } catch (error) {
    console.log("Database connection error:", error.message);
    process.exit(1);
  }
};

connectDB();

module.exports = app;
