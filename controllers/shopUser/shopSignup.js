require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const sendMail = require("../../mail/mail");
const bodyParser = require("body-parser");
const ShopUser = require("../../model/shopUser");
const fs = require("fs");
const multer = require('multer')
const path = require('path')
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const createshopUser = async (req, res) => {
  try{
    const storage = multer.diskStorage({
      destination: "./shopImage",
      filename: (req, file, cb) => {
        cb(
          null,
          Date.now() +
            path.extname(file.originalname + "." + file.mimetype.split("/")[1])
        );
      },
    });

    const upload = multer({ storage: storage }).single("file");
    
   
 upload(req, res,async (err) => {
      const fileName = req.file.path;
      const filetype = req.file.mimetype.split("/");
     if (
       !(
         req.body.firstname &&
         req.body.lastname &&
         req.body.phone &&
         req.body.password &&
         req.body.location &&
         req.body.service
       )
     ) {
       return res.status(400).json({ message: "All input is required" });
     }
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await ShopUser.findOne({ phone: req.body.phone });

    if (oldUser) {
      return res.status(409).json({message: "User Already Exist. Please Login"});
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT));  
    const location = req.body.location.split(",");
    const service = req.body.service.split(",");

     const userImage = await ShopUser.findOne({
       $and: [{ phone: req.body.phone }, { type: req.body.type }],
     });
    // Create user in our database
     if (!userImage) {
       var img = fs.readFileSync(req.file.path);
       var encode_img = img.toString("base64");
       const image = {
         data: new Buffer.from(encode_img, "base64"),
         contentType: req.file.mimetype,
       };
       const user = await ShopUser.create({
         phone: req.body.phone,
         firstname: req.body.firstname,
         lastname: req.body.lastname,
         rephone: req.body.rephone,
         email: req.body.email, // sanitize: convert email to lowercase
         password: encryptedPassword,
         location: { coordinates: [location[0], location[1]] },
         shop: service,
         geo_address: req.body.geo_address,
         discription: req.body.discription,
         type: req.body.type,
         deviceToken: req.body.deviceToken,
        //  image: image,
         imagePath: fileName,
       });
       if (user) {
         sendMail.sendMail();
         return res.status(201).json({message:"Shop user created successfully", user });
       } else {
         return res.status(409).send({ message: "something went wrong" });
       }
     }
    else {
      return res.status(409).json({ message: "User creation Failed" });
    }
  })
  } catch (err) {
    console.log(err);
  }
}

module.exports = createshopUser;
