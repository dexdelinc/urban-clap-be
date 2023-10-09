require("dotenv").config();
require("../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/user");
const cors = require('cors');
const { collection } = require("../model/user");
const sendMail = require("../mail/mail");
const fs = require('fs')
const bodyParser = require("body-parser");
const path=require('path')
const multer =require('multer')
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// FOR RESOVLE THE CORS ERROR
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Content-Type", "multipart/form-data")
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// app.use("/images", express.static('./serviceImage'));

// const storage = multer.diskStorage({
//   destination: './serviceImage',
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });


//  app.post("/image", upload.single("file"), async (req, res) => {
//    try {
//      await sharp(req.file.buffer)
//        .resize({ width: 250, height: 250 })
//        .png()
//        .toFile(__dirname + `/images/${req.file.originalname}`);
//      res.status(201).send("Image uploaded succesfully");
//    } catch (error) {
//      console.log(error);
//      res.status(400).send(error);
//    }
//  });

const createUser = async (req, res) => {
  try {
   
    const storage = multer.diskStorage({
      destination: "./serviceImage",
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
     console.log(req.body.needDelBag);
  console.log((req.body.service));

  for(let i of req.body.service){
    console.log(i);
  }

   
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ phone: req.body.phone });

    if (oldUser) {
      return res.status(409).json({message: "User Already Exist. Please Login"});
    }
    const location = req.body.location.split(",");
const service = req.body.service.split(",");
    //Encrypt user password
    encryptedPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT));

     const userImage = await User.findOne({
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
       let user = await User.create({
         phone: req.body.phone,
         firstname: req.body.firstname,
         lastname: req.body.lastname,
         rephone: req.body.rephone,
         email: req.body.email, // sanitize: convert email to lowercase
         password: encryptedPassword,
         location: { coordinates: [location[0], location[1]] },
         service: service,
         geo_address: req.body.geo_address,
         discription: req.body.discription,
         type: req.body.type,
         deviceToken: req.body.deviceToken,
        //  image: image,
         imagePath: fileName,
       });
       if(user.service.includes('634d13301ff749682b279f4b')){
        user= await User.findOneAndUpdate({_id:user._id},
          {$set : {status:2}},
          {
          new:true}) 
       }
       if(req.body.needDelBag!==''){
        console.log(req.body.needDelBag,user._id);
        user= await User.findOneAndUpdate({_id:user._id},
          {$set : {needDelBag:req.body.needDelBag}},
          {
          new:true}) 
        
        console.log("asuccessFul");
       }
       if (user) {
         sendMail.sendMail(); 
        return res
          .status(201)
          .json({ message: "Service user created successfully", user });
       } else {
         return res.status(500).send({ message: "something went wrong" });
       }
       
     }
    else {
      return res.status(400).json({ message: "User creation Failed" });
    }
  })
  } catch (err) {
    console.log(err);
  }
  
}


module.exports = createUser