require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const User = require("../../model/user");
const ShopUser = require("../../model/shopUser");
const RazorPayment = require("../../model/razorpayment");
const moment = require('moment')

const app = express();
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())


const createPaymentUser = async (req, res) => {


    const { status, response, usertype } = req.body
    let token = req.headers['x-access-token']
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id
    const serviceUser = await User.findOne({ _id: { $eq: id } })
    const shopUser = await ShopUser.findOne({ _id: { $eq: id } })
    if (serviceUser) {
        const paymentHistory = await RazorPayment.create({
            status: status,

            response: response,
            user: serviceUser._id,
            usertype: usertype,

        });
        const updateUser = await User.updateOne({ _id: { $eq: id } }, {
            $set: {
                status: 2
            }
        }, { new: true })
        if (updateUser.modifiedCount) {
            return res.status(200).json({ message: "Your profile has updated successfully" });
        }
        return res.status(201).json({ paymentHistory });

    }

    if (shopUser) {
        const paymentHistory = await RazorPayment.create({
            status: status,

            response: response,
            user: shopUser._id,
            usertype: usertype
        });
        const updateUser = await ShopUser.updateOne({ _id: { $eq: id } }, {
            $set: {
                status: 2
            }
        }, { new: true })
        if (updateUser.modifiedCount) {
            return res.status(200).json({ message: "Your profile has updated successfully" });
        }
        return res.status(201).json({ paymentHistory });

    }
}

const getPaymentData = async (req, res) => {
    let token = req.headers['x-access-token']
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id
    const getUser = await User.findOne({ _id: { $eq: id } })
    if (getUser !== null) {
        const getPayUser = await RazorPayment.findOne({ user: { $eq:id} })
        if (getPayUser !== null) {
            m = moment(getPayUser.createdAt, 'YYYY-MM-DD')
            m.add(13, 'month')
            return res.status(200).json({ message: m, getPayUser })
        }
        else {
            return res.status(400).send("User not Found");
        }
    }
    if(getUser==null){
        const getShopUser = await ShopUser.findOne({ _id: { $eq: id } })
        console.log();
        const getPayUser = await RazorPayment.findOne({ user: { $eq:id } })
        console.log(getPayUser);
        if (getPayUser !== null) {
            m = moment(getPayUser.createdAt, 'YYYY-MM-DD')
            m.add(13, 'month')
            return res.status(200).json({ message: m, getPayUser })
        }
        else {
            return res.status(400).send("User not Found");
        }
    }

}


module.exports = { createPaymentUser, getPaymentData }