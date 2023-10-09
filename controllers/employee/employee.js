require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const sendMail = require("../../mail/mail");
const bodyParser = require("body-parser");
const Employee = require("../../model/employee");
const fs = require("fs");
const multer = require('multer')
const path = require('path')
const app = express();
const jwt = require("jsonwebtoken");
const EmployeeDoc=require("../../model/employeeDoc");

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const createEmployee = async (req, res) => {
  try{
    const storage = multer.diskStorage({
      destination: "./employeeImage",
      filename: (req, file, cb) => {
        cb(
          null,
          Date.now() +
            path.extname(file.originalname + "." + file.mimetype.split("/")[1])
        );
      },
    });

    const upload = multer({ storage: storage }).single("file");
    console.log(req.body);
   
 upload(req, res,async (err) => {
      const fileName = req.file.path;
      console.log(fileName);
      const filetype = req.file.mimetype.split("/");
     if (
       !(
         req.body.firstname &&
         req.body.lastname &&
         req.body.phone &&
         req.body.password &&
         req.body.location 
       )
     ) {
       return res.status(400).json({ message: "All input is required" });
     }
    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await Employee.findOne({ phone: req.body.phone });

    if (oldUser) {
      return res.status(409).json({message: "User Already Exist. Please Login"});
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(req.body.password, Number(process.env.BCRYPT_SALT));  
    const location = req.body.location.split(",");
    // const service = req.body.service.split(",");

     const userImage = await Employee.findOne({
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
       const employee = await Employee.create({
         phone: req.body.phone,
         firstname: req.body.firstname,
         lastname: req.body.lastname,
         rephone: req.body.rephone,
         email: req.body.email, // sanitize: convert email to lowercase
         password: encryptedPassword,
         location: { coordinates: [location[0], location[1]] },
        //  shop: service,
         geo_address: req.body.geo_address,
         discription: req.body.discription,
         type: req.body.type,
         deviceToken: req.body.deviceToken,
        //  image: image,
         imagePath: fileName,
       });
       if (employee) {
         sendMail.sendMail();
         return res.status(201).json({message:"Employee register successfully", employee });
       } else {
         return res.status(500).send({ message: "something went wrong" });
       }
     }
    else {
      return res.status(400).json({ message: "Employee register Failed" });
    }
  })
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "Something went wrong" });

  }
}

// For Employee login...............

const Employeelogin = async (req, res) => {
  try {
    // Get user input
    const { phone, password,deviceToken } = req.body;
    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
    }
    let getUser = await Employee.findOne({ phone: { $eq: req.body.phone } });
    if(!getUser){
      return res.status(400).json({message:"Employee not exist! Please Signup first!"})
     }
    if (getUser !== null) {
      let password = getUser.password;
      let verifyPassword = await bcrypt.compare(req.body.password, password);
      // console.log(process.env.TOKEN_KEY);

      if (verifyPassword) {
        const token = jwt.sign({ id: getUser._id }, process.env.TOKEN_KEY, {
          expiresIn: "28d",
        });
        if(getUser){
        getUser =await Employee.updateOne(  { _id: { $eq: getUser._id } },
          {
            $set: {
              deviceToken: deviceToken,
            },
          },
          { new: true })
        }
        return res
          .status(200)
          .json({ message: "Employee Login SuccessFully", token });
      } else {
        return res.status(400).json({ message: "Password not matched" });
      }
    }
    if(getUser.status==0){
     return res.status(400).json({message:"Your Account Deactivated Please Contact to Admin"})
    }
    else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
// get Employee details by token
const getEmployee = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getEmployee = await Employee.findOne({ _id: { $eq: id } });
  // console.log(getUser.service)
  // let ServiceId=getUser.service
  // const service=await Service.findOne({_id: {$eq:ServiceId}})
  // const ServiceName=service.name
  if (getEmployee !== null) {
    res.status(200).json({ getEmployee });
  } else {
    res.status(400).send("Employee not Found");
  }
};

const uploadEmployeeDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const storage = multer.diskStorage({
      destination: "./employeeDoc" + "/" + id,
      filename: (req, file, cb) => {
        cb(
          null,
          Date.now() +
          path.extname(file.originalname + "." + file.mimetype.split("/")[1])
        );
      },
    });

    const upload = multer({ storage: storage }).array("file");

    upload(req, res, async (err) => {
      var image = [];
      for (let i = 0; i < req.files.length; i++) {
        image.push(req.files[i].path);
      }

      // check if user already exist
      // Validate if user exist in our database

      const employee = await Employee.findOne({ _id: id });
      // Create user in our database
      if (employee) {
        const document = await EmployeeDoc.create({
          type: "Employee",
          imagePath: image,
         employeeId: employee,
        });
        if (document) {
          return res
            .status(201)
            .json({ message: "Documents uploaded successfully", document });
        } else {
          return res.status(400).send({ message: "Document Upload Failed" });
        }
      } else {
        return res.status(400).json({ message: "Document Upload Failed" });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "something went wrong" });

  }
};
const getEmployeeDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getEmployeeDoc = await EmployeeDoc.findOne({
      employeeId: { $eq: id },
    });
    // console.log(getUser.service)
    // let ServiceId=getUser.service
    // const service=await Service.findOne({_id: {$eq:ServiceId}})
    // const ServiceName=service.name
    if (getEmployeeDoc !== null) {
      return res.status(200).json({ getEmployeeDoc });
    } else {
      return res.status(400).json({ message: "EmployeeDoc not Found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = { createEmployee, Employeelogin, getEmployee,uploadEmployeeDoc,getEmployeeDoc };
