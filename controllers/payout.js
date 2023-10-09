require("dotenv").config();
require("../db/connection");
const express = require("express");
const payout = require("../model/payoutRequest");
const ShopUser = require("../model/shopUser");
const jwt = require("jsonwebtoken");

const payoutRequest = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const shopUser = await ShopUser.findOne({ _id: id });
  console.log(shopUser.bankDetails);
  if (shopUser) {
    const payoutRequest = await payout.create({
      amount: req.body.amount, // sanitize: convert email to lowercase
      payoutRequestStatus: "unpaid",
      shopUser: id,
      bankDetails: shopUser.bankDetails,
    });
    if (payoutRequest) {
      return res.status(200).json({ message: "Payout request send to Admin" });
    }
  }
  if (!payoutRequest) {
    return res
      .status(400)
      .json({ message: "*Payout request send to Admin Failed!" });
  }
};

const getpayoutRequest = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log(id);
    const payoutRequest = await payout.find({
      $and: [
        { shopUser: id },
        { payoutRequestStatus: "unverified" || "verified" },
      ],
    });

    res.status(200).send(payoutRequest);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getpayoutRequest,
  payoutRequest,
};
