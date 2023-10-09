require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const getCharges = async (req, res) => {
   let upiId="6284052034@paytm"
   let val=Math.floor(1000 + Math.random() * 9000);
    let payload={
        deliveryChargePerKm: 10,
        taxInPercent: 18,
        serviceCharge: 20,
        text:"year",
        planTime:1,
        planFee:730,
        publishableKey: process.env.publishableKey,
        upi:"tez://upi/pay?pa=panwarsunit@okhdfcbank&pn=Swork7&tr=11426866303&tid=NYK-176044-6770938&am=1.00&cu=INR&tn=UPI%20Transaction%20for%20NYK-176044-6770938"
    }

    console.log(payload);
      return res.status(200).json(payload);
   
  };

module.exports = {getCharges};