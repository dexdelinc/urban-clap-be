require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const adminLogin = async (req, res) => {
  try {
    // Get user input
    console.log("");
    const { phone, password } = req.body;
    // Validate user input
    if (!(req.body.phone && req.body.password)) {
      res.status(400).send("All input is required");
    }
    const oldUser = await mongoose.connection.db
      .collection("admin")
      .find()
      .toArray();
    if (!oldUser) {
      return res
        .status(409)
        .json({ message: "Admin Not Exist. Please Resister First" });
    }
console.log(oldUser);
    if (oldUser[0].phone == phone) {
      let password1 = oldUser[0].password;
      let verifyPassword = await bcrypt.compare(password, password1);
      if (verifyPassword) {
        const token = jwt.sign({ id: oldUser[0]._id }, process.env.TOKEN_KEY, {
          expiresIn: "28d",
        });
        return res
          .status(200)
          .json({ message: "Admin User User Login SuccessFully", token });
      }
      if (!verifyPassword) {
        return res.status(400).json({ message: "Password not matched" });
      }
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = adminLogin;
