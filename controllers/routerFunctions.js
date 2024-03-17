/* This file contains all the callback functions that will be referenced in the routes */

const bcrypt = require("bcrypt");
const { dbGetUser, dbAddUser, dbGetNewId } = require('../models/dbFunctions');

// Register New User:
exports.createUser = async (req, res) => {
  alert('hi');
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await dbGetUser(email);
    if (user) {
      console.log("User already exists!");
      return res.redirect("/");
    }
    // Hash password before storing in local DB:
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store new user in local DB
    const newId = dbGetNewId();
    await dbAddUser(newId, firstName, lastName, email, hashedPassword);
    console.log("Successfully added user");
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSignUp = (req, res) => {
  res.render("sign-up");
};