require("dotenv").config();
require("../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Service = require("../model/service");
const cors = require('cors')
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())
const getServiceData=async(req,res)=>{

    const body = req.body;
    let criteria = {$and:[{status:{$eq:1}}]};
    
    if(body.hasOwnProperty('search') && body.search !=''){
      criteria.$and.push({name:{$regex: ".*" + body.search + ".*"}});     
    }
    
    const getService=await Service.find();
    if(getService){
      return res.status(200).json({status:"true",data:getService})
    }
    if(!getService){
      return res.status(400).json({message:"Service Not Found",status:"false"})
  
    }

  }

  // const getServiceDataLike=async(req,res)=>{
  //   const getService=await Service.find({status:{$eq:1}})
  //   if(getService){
  //     return res.status(200).json({status:"true",data:getService})
  //   }
  //   if(!getService){
  //     return res.status(400).json({message:"Service Not Found",status:"false"})
  
  //   }
  // }
  
  module.exports={getServiceData}