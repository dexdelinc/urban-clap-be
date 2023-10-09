require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ShopUser = require("../../model/shopUser");
const Image = require("../../model/image");
const Shop = require("../../model/shop");
const cors = require("cors");
const bodyParser = require("body-parser");
const shopUsersDoc = require('../../model/shopUsersDoc')
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
const { Contact, FundAccount, Payout } = require("razorpayx-nodejs-sdk")("rzp_test_DcaB0F33pE7sHt", "W0HcKALJw5ql7QzMoaSGIZMK");
const adminBankAccount=2323230007450214
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const shopProviderUser = async (req, res) => {
  // let lat = 28.672818;
  // let lng = 77.3862836;
  // let service  = "631dbd4c8f89dd5475021427";
  const { shop, lat, lng } = req.body;

  try {
    let getUser = await ShopUser.find({
      $and: [
        //   {
        //   location: {
        //     $near: {
        //       $maxDistance: 200000,
        //       $geometry: {
        //         type: "Point",
        //         coordinates: [lat, lng]
        //       }
        //     }
        //   }
        // },
        { shop: shop },
        { status: 2 },
        { shopAvalStatus: 2 },
      ],
    });

    // let getUser = await ShopUser.find({ $and : [{
    //   location: {
    //     $near: {
    //       $maxDistance: 200000,
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [lat, lng]
    //       }
    //     }
    //   }
    // },{shop:shop},{status:2}]});
    if (getUser) {
      return res.status(200).send(getUser);
    }
  } catch (e) {
    res.status(500).send(e.message);
    console.log(e);
  }
};

// change availale status of shop
const updateAvalStatus = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const { avalStatus } = req.body;
    const updateUser = await ShopUser.updateOne(
      { _id: { $eq: id } },
      {
        $set: {
          shopAvalStatus: avalStatus,
        },
      },
      { new: true }
    );
    if (updateUser) {
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

// shopuser Profile
const getShopUserData = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getUser = await ShopUser.findOne({ _id: { $eq: id } });
  // console.log(getUser.service)
  // let ServiceId=getUser.service
  // const service=await Service.findOne({_id: {$eq:ServiceId}})
  // const ServiceName=service.name

  if (getUser !== null) {
    const getImage = await Image.find({
      $and: [{ phone: getUser.phone }, { type: "shops" }],
    });
    return res
      .status(200)
      .json({ message: "Welcome to Your dashboard", getUser });
  } else {
    return res.status(400).send("User not Found");
  }
};
const uploadShopDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const storage = multer.diskStorage({
      destination: "./shopDoc" + "/" + id,
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

      const shopUser = await ShopUser.findOne({ _id: id });
      // Create user in our database
      if (shopUser) {
        const document = await shopUsersDoc.create({
          type: "ShopUser",
          imagePath: image,
          shopUserId: shopUser,
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
const getShopDoc = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getShopDoc = await shopUsersDoc.findOne({
      serviceUserId: { $eq: id },
    });
    // console.log(getUser.service)
    // let ServiceId=getUser.service
    // const service=await Service.findOne({_id: {$eq:ServiceId}})
    // const ServiceName=service.name
    if (getShopDoc !== null) {
      return res.status(200).json({ getShopDoc });
    } else {
      return res.status(400).json({ message: "ShopDoc not Found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// addd account detail
const Stripe = require("stripe");
let publishableKeySecret =process.env.publishableKeySecret;
const stripe = Stripe(publishableKeySecret);
const addBank = async (req, res) => {
  try {

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const shopuser =await ShopUser.updateOne(
      { _id: { $eq:id } },
      {
        $set: {
          bankDetails: req.body.bankAccount,
        },
      },
      { new: true }
    )
    if(shopuser){
      return res.status(200).json({message:"Bank details add Successfully",shopuser})
    }else{
      res.status(400).json({
        message:"Bank details add Failed!"
      })
    }

    // // console.log(req.body);

    // let contacts = await Contact.create({
    //   name: name,
    // })
   
    
    
    //  let FundAccounts = await FundAccount.create({
    //     contact_id: contacts.id,
    //     account_type:"bank_account" ,
    //     bank_account: {
    //       name: req.body.bankAccount.name,
    //       ifsc: req.body.bankAccount.ifsc,
    //       account_number: req.body.bankAccount.account_number
    //     }
    //   })
    //   // console.log("FundAccounts", FundAccounts.id);
    // // return

    // const addBank = await ShopUser.updateOne(
    //   { _id: { $eq: id } },
    //   {
    //     $set: {
    //       bankId: FundAccounts.id,

    //     },
    //   },
    //   // {upsert:true},
    //   { new: true }
    // )
    // const dummy= await ShopUser.findOne({_id:id})
    // console.log(dummy);
    // console.log("fund acc created succussfully!", FundAccounts);
    // return res.status(201).json({
    //   addBank
    // })
    // const account = await stripe.accounts.create({
    //   type: 'custom',
    //   country: 'IN',
    //   email: 'jenny.rosen@example.com',
    //   capabilities: {
    //     card_payments: {requested: true},
    //     transfers: {requested: true},
    //   },
    // });
    // console.log(account);
    // const bankAccount = await stripe.tokens.create({
    //   card: {
    //     number: '4007823212000533',
    //     exp_month: 06,
    //     exp_year: 28,
    //     cvc: '304',
    //   },
    //   // bank_account: {
    //   //   country: 'IN',
    //   //   currency: 'inr',
    //   //   routing_number: 'ICIC0003212', // This is not required for India
    //   //   account_number: '321201503108	',
    //   //   account_holder_name: 'Saurabh Rathor',
    //   //   account_holder_type: 'individual',
    //   //   // ifsc: 'HDFC0000261', // The IFSC code of the vendor's bank
    //   // },
    // });
    // console.log(bankAccount);

    // const transfer = await stripe.transfers.create({
    //   amount: 1000, // The amount in paisa to transfer
    //   currency: 'inr',
    //   destination: bankAccount.card.id, // The vendor's Stripe account ID
    //   source_type: 'card',
    //   // source: bankAccount.id, // The ID of the bank account token created in step 4
    // });
    // console.log(transfer);

    // return
    // const transfer = await stripe.transfers.create({
    //   amount: 100, // The amount in paisa to transfer
    //   currency: 'inr',
    //   })
  }

  catch (error) {
    console.log(error);
return res.status(500).json("Something went wrong")
  }
}
const shopWithdrawl=async (req,res)=>{
  try {
    // let account_number = req.body.account_number;
    let fund_account_id = req.body.bankId; 
    let amount = req.body.amt;

    const transfer = await stripe.transfers.create({
      amount: 1000, // The amount in paisa to transfer
      currency: 'inr',
      destination: 'acct_1234', // The vendor's Stripe account ID
      source_type: 'bank_account',
      source: bankAccount.id, // The ID of the bank account token created in step 4
    });

    console.log(transfer);
    return res.status(201).json({
        success: true,
        payouts
    })
} catch (err) {
    console.log(err.message)
}
}

module.exports = {
  shopProviderUser,
  getShopUserData,
  updateAvalStatus,
  uploadShopDoc,
  getShopDoc,
  addBank,
  shopWithdrawl
};
