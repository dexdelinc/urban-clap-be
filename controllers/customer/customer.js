require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const Customer = require("../../model/customer");
const cors = require("cors");
// const { collection } = require("../../model/user");
const sendMail = require("../../mail/mail");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "image");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const createCustomer = async (req, res) => {
  try {
    // Get user input
    const {
      phone,
      firstname,
      lastname,
      password,
      location,
      service,
      rephone,
      email,
      geo_address,
      deviceToken,
    } = req.body;

    // let filePath=`/image/${Date.now()}_${image}`
    // let buffer =Buffer.from(image,"base64")
    // fs.writeFileSync(path.join(__dirname,filePath),buffer);

    // Validate user input
    if (!(firstname && lastname && phone && password && location)) {
      return res.status(400).send({ message: "All input is required" });
    }
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await Customer.findOne({ phone });

    if (oldUser) {
      return res
        .status(409)
        .send({ message: "Customer Already Exist. Please Login" });
    }
    console.log(deviceToken);
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT)
    );

    // Create user in our database
    const customer = await Customer.create({
      phone: phone,
      firstname: firstname,
      lastname: lastname,
      rephone: rephone,
      email: email, // sanitize: convert email to lowercase
      password: encryptedPassword,
      location: { coordinates: location },
      // service: service,
      deviceToken: deviceToken,
      geo_address: geo_address,
    });

    res.status(201).json({ customer });
    sendMail.sendMail();
  } catch (err) {
    console.log(err);
  }
};
// For customer login...............

const Customerlogin = async (req, res) => {
  try {
    // Get user input
    const { phone, password, deviceToken } = req.body;
    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
    }
    let getUser = await Customer.findOne({ phone: { $eq: req.body.phone } });
    if (!getUser) {
      return res
        .status(400)
        .json({ message: "Customer not exist! Please Signup first!" });
    }
    if (getUser !== null) {
      let password = getUser.password;
      let verifyPassword = await bcrypt.compare(req.body.password, password);
      // console.log(process.env.TOKEN_KEY);

      if (verifyPassword) {
        const token = jwt.sign({ id: getUser._id }, process.env.TOKEN_KEY, {
          expiresIn: "28d",
        });
        
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
          getUser = await Customer.updateOne(
            { _id: { $eq: getUser._id } },
            {
              $set: {
                deviceToken: deviceToken,
              },
            },
            { new: true }
          );
          console.log(getUser);
        
        return res
          .status(200)
          .json({ message: "Customer Login SuccessFully", getUser, token });
      } else {
        return res.status(400).json({ message: "Password not matched" });
      }
    }
    // if(getUser.status==0){
    //  return res.status(400).json({message:"Your Account Deactivated Please Contact to Admin"})
    // }
    else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// get customer details by token
const getCustomer = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getCustomer = await Customer.findOne({ _id: { $eq: id } });
  // console.log(getUser.service)
  // let ServiceId=getUser.service
  // const service=await Service.findOne({_id: {$eq:ServiceId}})
  // const ServiceName=service.name
  if (getCustomer !== null) {
    res.status(200).json({ getCustomer });
  } else {
    res.status(400).send("Customer not Found");
  }
};
module.exports = { createCustomer, Customerlogin, getCustomer };
