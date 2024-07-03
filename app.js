const express = require("express");
const app = express();
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Contact = require("./models/model");

const mongoURI = process.env.DB_HOST;
// const { DB_HOST: urlDb } = process.env;
// const connection = mongoose.connect(urlDb);

const contactsRouter = require("./routes/contacts");

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Not found - ${req.path}` });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

// connection
//   .then(() => {
//     console.log("DB connected");
//   })
//   .catch((error) => {
//     console.log(error);
//     process.exit(1);
//   });
const startServer = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Database connection successful.");
    // app.listen(3000, () => {
    //   console.log("Server is running on port 3000");
    // });
  } catch (error) {
    console.log("Database connection error:", error.message);
    process.exit(1);
  }
};

startServer();

const testDatabaseConnection = async () => {
  const contacts = await Contact.find();
  console.log("Contacts:", contacts);
};

testDatabaseConnection();

module.exports = app;
