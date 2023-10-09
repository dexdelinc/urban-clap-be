require("dotenv").config();
require("../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const getserviceUser = require("../model/getserviceUser");
const User = require("../model/user");
const cors = require('cors')
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())


const creategetserviceUser =async (req, res) => {
    try {
      // Get user input
      const { name,phone,user} = req.body;
      // Validate user input
      if (!(name && phone && user)) {
       return res.status(400).json({message:"All input is required"});
      }
      const getUser = await User.findOne({ _id: { $eq: user } })
     
  
      // Create user in our database
      const consumer = await getserviceUser.create({
        phone:phone,
        name: name,
        user:getUser
        
      });
  
  
     return res.status(201).json({message:"User found service", consumer });
    } catch (err) {
      console.log(err);
    }
  }

  module.exports={creategetserviceUser}