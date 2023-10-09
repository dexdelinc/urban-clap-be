require("dotenv").config();
require("../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Image = require("../model/image");
const serviceUsersDoc = require("../model/serviceUsersDoc");
const Service = require("../model/service");
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

const getUserData = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getUser = await User.findOne({ _id: { $eq: id } });
  // console.log(getUser.service)
  // let ServiceId=getUser.service
  // const service=await Service.findOne({_id: {$eq:ServiceId}})
  // const ServiceName=service.name
  if (getUser !== null) {
    const getImage = await Image.find({
      $and: [{ phone: getUser.phone }, { type: "services" }],
    });
    return res.status(200).json({ getUser, getImage });
  } else {
    return res.status(400).send("User not Found");
  }
};
//get service user
const serviceProviderUser = async (req, res) => {
  // let service  = "631dbd4c8f89dd5475021427";
  const { service, lat, lng } = req.body;

  try {
    let getUser = await User.find({
      $and: [
        {
          // location: {
          //   $near: {
          //     $maxDistance: 10000,
          //     $geometry: {
          //       type: "Point",
          //       coordinates: [lat, lng],
          //     },
          //   },
          // },
        },
        { service: service },
        { status: 2 },
        { serviceAvalStatus: 2 },
      ],
    });

    res.status(200).send(getUser);
  } catch (e) {
    res.status(500).send(e.message);
  }

  //   const { service } = req.body
  //  const getUser=await User.find({}).where('service').in(service).exec()

  //   const getserviceName=await Service.findOne({_id:{$eq:service}})
  //   console.log(getserviceName)
  //    if(getUser){
  //     return res.status(200).json({getUser,getserviceName})
  //    }
  //   if(!getUser){
  //    return res.status(400).json({message:"Service Not Found"})
  //   }

  // const getUser = await User.find({
  //   $geoNear: {
  //     maxDistance: 400,
  //     num: 2,
  //     near:  [lat, lng] ,
  //     spherical:true,
  //     key: "location",
  //     distanceField: "distance"
  // }
  // })
};
// User.aggregate([
// {
//   $lookup:{
//     from:"Service",
//     as:"profile",
//     let:{service:"$_id"},
//     pipeline:[
//       {$match:{expr:{$eq:['$service','$$service']}}}
//     ]
//   }
// },
// {
//   $project:{
//     _id:1,
//     phone:1,
//     name:1,
//     profile:1
//   }
// }
// ]).exec((err,result)=>{
//   if(err){
//     res.send(err)
//     console.log(err)
//   }
//   if(result){
//     res.send(result)
//   }
// })
// }catch(err){
//   console.log(err)
// }
//   let matchObj={};
//   let serviceDetails;
//   const { service } = req.body
//   console.log("hello")
//   if(!service){
//    return res.status(400).json({message:"Service Is Required"})
//   }

//   console.log(req.body.service);
//  if(req.body.service){
// matchObj['service']=mongoose.Types.ObjectId(req.body.service);
//  }
// let arg={
//   query:[
//     {
//       $match:{...matchObj,status:1}
//     },
//     {
//       $lookup:{
//         from:"services",
//         localField:"service",
//         foreignField:"_id",
//         as:"serviceDetails"
//             }
//     },{
//       $unwind:"$serviceDetails"
//     }
//   ]
// }

// let getUser= await  User.aggregate([{
//     arg
//   }
// ])

// Model.aggregate([{
//   $group: {
//     _id: "$id",
//     count: { $sum: "$like.count" }
//   }
// }])
//   aggregate([{
//     $match: {"service" : req.body.service },
//     "$lookup": {
//      "from": "services",
//      "let": { "services": "$serviceId", "clinic_id": "$clinic_id" },
//      "pipeline": [
//        { "$match": {
//          "$expr": {
//            "$and": [
//              { "$eq": ["$patientId", "$$patientId"] },
//              { "$eq": ["$branchId", "$$clinic_id"] }
//            ]
//          },
//          "acknowleged": false
//        }}
//      ],
//      "as": "notif"
//  }}])

// ).where('service').in(req.body.service).exec(

//   let serviceInfo;
//   const getUser=await User.aggregate([{
//     $lookup:
//       {
//         from: "Service",
//         localField: 'name',
//         foreignField: '_id',
//         as: 'Service'
//       }
//  }])

// Find  Service ducument of perticular given service

const getServiceData = async (req, res) => {
  const getUser = await User.find({});

  if (getUser) {
    return res.status(200).json({ getUser });
  }
  if (!getUser) {
    return res.status(400).json({ message: "Service Not Found" });
  }
};
// For Update Firstnam and lastname@@@@@@@@@@@@@@@@@@@@@

const updateUserData = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    // console.log(id);
    const { firstname, lastname } = req.body;

    const updateUser = await User.updateOne(
      { _id: { $eq: id } },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
        },
      },
      { new: true }
    );
    if (updateUser) {
      res
        .status(200)
        .json({ message: "Your profile has updated successfully" });
    } else {
      res.status(400).send("User Update Failed");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
};
// update live location trun by trun for delevery 

const updateTempLocation = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    // console.log(id);
    const { lat, lng } = req.body;
    const updateUser = await User.updateOne(
    {
      $and:[{ service: "634d13301ff749682b279f4b" },{_id:id}]
    }, { $set:{
      tempLocation:{ lat:lat,lng:lng },
    }},{new:true}
    );
    if (updateUser) {
      res
        .status(200)
        .json({ message: "Your tempLocation updated successfully" });
    } else {
      res.status(400).send("User tempLocation Failed");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
};
const updatePassword = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  let { OldPassword, password } = req.body;
  let getUser = await User.findOne({ _id: { $eq: id } });
  let dbPassword = getUser.password;
  if (!OldPassword && password) {
    return res
      .status(400)
      .json({ message: "OldPassword or NewPassword Missing" });
  }

  let passwordMatch = await bcrypt.compare(OldPassword, dbPassword);

  if (!passwordMatch) {
    return res.status(400).send({ message: "Invalid old password" });
  }
  if (await bcrypt.compare(req.body.password, dbPassword)) {
    return res
      .status(400)
      .send({ message: "oldpassword is same as newpassword" });
  }

  let updatePassword = await User.updateOne(
    { _id: id },
    {
      $set: {
        password: await bcrypt.hash(password, Number(process.env.BCRYPT_SALT)),
      },
    },
    { new: true }
  );

  if (updatePassword.modifiedCount) {
    return res
      .status(200)
      .send({ message: "Your password has been updated successfully" });
  } else {
    return res.status(400).send("Password Update Failed");
  }
};

const updateAvalStatus = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    console.log(id);
    const { avalStatus } = req.body;

    const updateUser = await User.updateOne(
      { _id: { $eq: id } },
      {
        $set: {
          serviceAvalStatus: avalStatus,
        },
      },
      { new: true }
    );
    if (updateUser.modifiedCount) {
      res
        .status(200)
        .json({ message: "Your profile Status updated successfully" });
    } else {
      res.status(400).send("User Profile Status Update Failed");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getUser = await User.findOne({ _id: { $eq: id } });
  // let email = getUser.email
  // console.log(email);
  if (!getUser) {
    res.status(400).json({ messesge: "User doesn't exist" });
  } else {
    const deleteUser = await User.deleteOne({ _id: id });

    if (deleteUser) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(400).send("User delete failed");
    }
  }
};

const uploadServiceDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const storage = multer.diskStorage({
      destination: ("./serviceDoc" + "/" + id),
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
      var image = []
      for (let i = 0; i < req.files.length; i++) {
        image.push(req.files[i].path)
      }
      
      // check if user already exist
      // Validate if user exist in our database

      const serviceUser = await User.findOne({ _id: id });
      // Create user in our database
      if (serviceUser) {
        const document = await serviceUsersDoc.create({
          type: "ServiceUser",
          imagePath: image,
          serviceUserId: serviceUser,
        });
        if (document) {
          return res
            .status(201)
            .json({ message: "Documents uploaded successfully", document });
        } else {
          return res.status(409).send({ message: "something went wrong" });
        }
      } else {
        return res.status(409).json({ message: "User creation Failed" });
      }
    });
  } catch (err) {
    console.log(err);
  }
};
const getServiceDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getServiceDoc = await serviceUsersDoc.findOne({
      serviceUserId: { $eq: id },
    });
    // console.log(getUser.service)
    // let ServiceId=getUser.service
    // const service=await Service.findOne({_id: {$eq:ServiceId}})
    // const ServiceName=service.name
    if (getServiceDoc !== null) {
      return res.status(200).json({ getServiceDoc });
    } else {
      return res.status(400).json({message:"ServiceDoc not Found"});
    }
  } catch (error) {
    return res.status(500).json({message:"Something went wrong"})
  }
};
const getDeliveryBoyById= async (req, res) => {
 try{ let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  const {id}=req.body
  console.log(req.body);
  const getUser = await User.findOne({ _id: { $eq: id } });
  console.log(getUser);
  if (getUser !== null) {
    return res.status(200).json({ getUser});
  } else {
    return res.status(400).json({message:"DeliveryBoy not Found"});
  }}catch(err){
  console.log(err);
  return res.status(500).json({message:err.message})
  }
}
module.exports = {
  getUserData,
  updateUserData,
  updatePassword,
  updateAvalStatus,
  deleteUser,
  serviceProviderUser,
  getServiceData,
  uploadServiceDoc,
  getServiceDoc,
  updateTempLocation,
  getDeliveryBoyById
};
