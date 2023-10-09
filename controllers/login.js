require("dotenv").config();
require("../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const cors = require("cors");
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const login = async (req, res) => {
  try {
    // Get user input
    console.log(req.headers);
    const { phone, password, deviceToken } = req.body;
    // console.log("!!!!!!!!!",req.body.deviceToken);
    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
    }
    const oldUser = await User.findOne({ phone });
    // console.log(oldUser);
    if (!oldUser) {
      return res
        .status(409)
        .json({ message: "User Not Exist. Please Resister First" });
    }
    if (oldUser) {
      let getUser = await User.findOne({ phone: { $eq: req.body.phone } });
      // console.log(getUser);
      if (getUser.status == 0) {
        return res
          .status(400)
          .json({
            message: "Your Account Deactivated Please Contact to Admin",
          });
      }
      if (getUser.status == 1 || 2) {
        let password = getUser.password;
        let verifyPassword = await bcrypt.compare(req.body.password, password);
        if (verifyPassword) {
          const token = jwt.sign({ id: getUser._id }, process.env.TOKEN_KEY, {
            expiresIn: "28d",
          });

           const  updateGetUser =await User.updateOne(  { _id: { $eq: getUser._id } },
              {
                $set: {
                  deviceToken: req.body.deviceToken,

                },
              },
              { new: true })
              console.log(getUser);
          return res
            .status(200)
            .json({
              message: "Service User Login SuccessFully",
              token,
              getUser,
            });
        }
        if (!verifyPassword) {
          return res.status(400).json({ message: "Password not matched" });
        }
      }
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = login;
