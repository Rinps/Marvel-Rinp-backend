// Load packages
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Initialize server
const app = express();
app.use(formidable());
app.use(cors());

// Connect to the database
const mongoURI = process.env.DATABASE_ADRESS;
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
});

// Every request will be made to the marvel-api, so we're storing the URL into a constant in order to have a clean code.
const apiURL = process.env.MARVEL_API_URL;

// Define routes
const characters = require("./routes/characters");
app.use(characters);
const comics = require("./routes/comics");
app.use(comics);
const user = require("./routes/user");
app.use(user);

// Get non defined routes
app.all("*", (req, res) => {
  console.log("Someone tried to communicate");
  res.status(200).json({ message: "Lol nope" });
});

// Lauch the server
app.listen(3111, () => {
  console.log("Let's go Marvel!");
});
