require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const ShopUser = require("../../model/shopUser");
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())


const ShopUserlogin = async (req, res) => {
  try {
    // Get user input
    const { phone, password ,deviceToken} = req.body;
    console.log(deviceToken);
    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
    }
    let getUser = await ShopUser.findOne({ phone: { $eq: req.body.phone } })
    if(!getUser){
      return res.status(400).json({message:"ShopUser not exist! Please Signup first!"})
     }
    if (getUser.status==1||2) {

      let password = getUser.password;
      let verifyPassword = await bcrypt.compare(req.body.password, password);

      if (verifyPassword) {
        const token = jwt.sign(
          { id: getUser._id },
          process.env.TOKEN_KEY,
          {
            expiresIn: "28d",
          }
        );
        getUser =await ShopUser.updateOne(  { _id: { $eq: getUser._id } },
          {
            $set: {
             
              deviceToken: deviceToken,
            },
          },
          { new: true })
       return res.status(200).json({ message:"Shop User Login SuccessFully", getUser, token });
      }
      else {
      return  res.status(400).json({message:"Password not matched"});
      }
    }
    if(getUser.status==0){
     return res.status(400).json({message:"Your Account Deactivated Please Contact to Admin"})
    }
    else {
      res.status(400).json({message:"Invalid Credentials"});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({message:"Something went wrong"});
  }
    
}

module.exports= ShopUserlogin