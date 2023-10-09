require("dotenv").config();
require("../../db/connection");
const express = require("express");
const cors = require("cors");
const ProductOrder = require("../../model/order");
const ShopUser = require("../../model/shopUser");
const User = require("../../model/user");
const ShopProduct = require("../../model/shopProduct");
const Order = require("../../model/order");
const jwt = require("jsonwebtoken");
const sendMail = require("../../mail/mail");
const Customer = require("../../model/customer");
const orderPayment = require("../../model/orderPayment");
const Employee=require('../../model/employee')
const app = express();
const Fcm = require('../fcm/fcm.js');
const { title } = require("process");
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());
const moment = require('moment');
const datetime=moment().format('MMMM Do YYYY, h:mm:ss a');

// Create a shopProduct

const createOrder = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log(id);
    // Get user input
    const {
      name,
      phone,
      email,
      item,
      orderItemPrice,
      totalPrice,
      totalProduct,
      address,
      location,
      product,
      su_id,
    
    } = req.body;
    // Validate user input
    // console.log(req.body);
    // check if user already exist
    // Validate if user exist in our database
    // console.log(orderItemPrice);
    const shopUser = await ShopUser.findOne({ _id: { $eq: su_id } });
    // Create order in our database
    const productOrder = await ProductOrder.create({
      name: name,
      phone: phone,
      email: email,
      item: item,
      orderItemPrice: orderItemPrice,
      totalPrice: totalPrice,
      totalProduct: totalProduct,
      address: address,
      location: { coordinates: location },
      shopProduct: product,
      shopUser: shopUser,
      customer :id,
      shopAddress:shopUser.geo_address
    });
    console.log(productOrder);
    let title = "You Get order by" + " " + name + " " + datetime
    if(shopUser.deviceToken!==null||undefined){
    Fcm.fcm(shopUser.deviceToken, title)
    }
    return res
      .status(201)
      .json({ message: "Order add Successfully", productOrder });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
const getOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const getOrder = await ProductOrder.find({
      $and: [{ phone: phone }],
    });
    if (getOrder !== null) {
      res.status(200).json(getOrder);
    }
  } catch (err) {
    console.log(err);
  }
};
const getOrderById = async (req, res) => {
  try {
    const { su_id } = req.body;
    const getOrder = await ShopProduct.find({
      $and: [
        {
          _id: su_id,
        },
      ],
    });
    console.log();
    if (getOrder !== null) {
      res.status(200).json(getOrder);
    }
    if (getOrder == null) {
      return res.status(400).json("product not exist");
    }
  } catch (err) {
    console.log(err);
  }
};

// for order details with auth user

const getAuthOrderById = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getOrder = await Order.find({
      $and: [
        { shopUser: id },
        { deliveryStatus: "Out for Delivery" },
       
      ],
    });
    // for(let i=0;i<getOrder.length;i++){
    //     var itemId = getOrder[i].item
    // }

    // console.log(itemId);
    // const shopProduct = await ShopProduct.find({ $and: [{ _id: itemId }] });
    // for(let i=0;i<getOrder.length;i++){
    //     getOrder[i].orderItemList.push(shopProduct);
    // }

    console.log(getOrder);
    if (getOrder !== null) {
      res.status(200).json({ getOrder });
    }
    if (getOrder == null) {
      return res.status(400).json("Order not exist");
    }
  } catch (err) {
    console.log(err);
  }
};

// For update the order status by shopUser
const updateShopOrderStatus = async (req, res) => {
  try {
    const { status, o_id } = req.body;

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getUser = await ShopUser.findOne({ _id: { $eq: id } });
    const updateShopOrder = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          o_id: o_id,
          status: status,
        },
      },
      { new: true }
    );
    let getShopOrder = await ProductOrder.findOne({ _id: { $eq: o_id } });

    let statusbar;
    if (getShopOrder.status == 0) {
      statusbar = "Canceled";
    }
    if (getShopOrder.status == 1) {
      statusbar = "Pending";
    }
    if (getShopOrder.status == 2) {
      statusbar = "Confirmed";
    }
    if (getShopOrder.status == 3) {
      statusbar = "Delivered";
    }
    const updateShopOrderNew = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          statusbar: statusbar,
        },
      },
      { new: true }
    );
     getShopOrder = await ProductOrder.findOne({ _id: { $eq: o_id } });

    const getCustomer=await Customer.findOne({_id:getShopOrder.customer}) || await ShopUser.findOne({_id:getShopOrder.customer})
    || await User.findOne({_id:getShopOrder.customer}) || await Employee.findOne({_id:getShopOrder.customer})







    let shopUser=await ShopUser.findOne({_id:getShopOrder.shopUser})
    if (getShopOrder.statusbar == "Confirmed" && getCustomer.deviceToken!==undefined||null||'') {
      let devicetoken =getCustomer.deviceToken
      let title = "Your order Confirmed by " + getShopOrder.getUser.firstname + " at  " + datetime
      Fcm.fcm(devicetoken, title)
    }
    if (getShopOrder.statusbar == "Canceled" && getCustomer.deviceToken!==undefined||null||'') {
      let devicetoken = getCustomer.deviceToken
      let title = "Your order Canceled by " + getShopOrder.getUser.firstname + " at  " + datetime
      Fcm.fcm(devicetoken, title)
    }
   
    if (getShopOrder.statusbar == "Delivered" && shopUser.deviceToken!==undefined||null||'') {
      let devicetoken = shopUser.deviceToken
      let title = "Your order successfully delivered to " + getShopOrder.name + " at  " + datetime
      Fcm.fcm(devicetoken, title)
    }
    if (updateShopOrderNew) {
      res
        .status(200)
        .json({
          message: "Your ShopOrderStatus has been updated successfully",
        });

    } else {
      res.status(400).json({ message: "ShopProductStatus Update Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};
// update delivery Status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, o_id } = req.body;

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getUser = await ShopUser.findOne({ _id: { $eq: id } });

    // let devicetoken = getShopOrder.shopUser.deviceToken
    // let title = "Your order successfully delivered to " + getShopOrder.name + " at  " + datetime
    // Fcm.fcm(devicetoken, title)
   
    const updateShopOrderNew = await Order.updateOne(
      { _id: o_id },
      {
        $set: {
          deliveryStatus: deliveryStatus,
        },
      },
      { new: true }
    );
    if (updateShopOrderNew) {
      res.status(200).json({
        message: "Your Delivery Status has been updated successfully",
      });

    } else {
      res.status(400).json({ message: "Delivery Status Update Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};
// get order product =====================

const getOrderProduct = async (req, res) => {
  try {
    const { op_id } = req.body;

    const getOrderProduct = await ShopProduct.find({
      $and: [
        {
          _id: { $in: op_id },
        },
      ],
    });
    if (getOrderProduct !== null) {
      res.status(200).json(getOrderProduct);
    }  
    if (getOrderProduct == null) {
      return res.status(400).json({ message: "Order Product not exist" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Update order Product===============================================

const updateShopOrder = async (req, res) => {
  try {
    const { o_id, item, totalPrice } = req.body;

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getUser = await ShopUser.findOne({ _id: { $eq: id } });
    const updateShopOrder = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          //rest of code
          item: item,
          totalPrice: totalPrice,
        },
      },
      { new: true }
    );
    if (updateShopOrder) {
      res
        .status(200)
        .json({ message: "Your ShopOrder has been updated successfully" });
      sendMail.sendMail();
    } else {
      res.status(400).json({ message: "ShopProduct Update Failed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};

// Order payment create history
const createPaymentOrder = async (req, res) => {
  const { status, response, usertype, orderId } = req.body;

  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const serviceUser = await User.findOne({ _id: { $eq: id } });
  const shopUser = await ShopUser.findOne({ _id: { $eq: id } });
  const customerUser = await Customer.findOne({ _id: { $eq: id } });

  if (serviceUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: serviceUser,
      usertype: usertype,
    });
    const updateOrder = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateOrder) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }

  if (shopUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: shopUser,
      usertype: usertype,
    });
    const updateUser = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateUser) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }
  if (customerUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: customerUser,
      usertype: usertype,
    });
    const updateUser = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateUser) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }
};
// get nearest delivery boy for order

const deliveryProviderUser = async (req, res) => {

  let service = "634d13301ff749682b279f4b"
  const { lat, lng } = req.body;
  console.log(req.body);
  try {
    let getUser = await User.find({
      $and: [
        {
          // location: {
          //   $near: {
          //     $maxDistance: 800,
          //     $geometry: {
          //       type: "Point",
          //       coordinates: [lat, lng],
          //     },
          //   },
          // },
        },
        { service: service },
        { status: 2 },

      ],
    });
    // console.log(getUser);
    res.status(200).json(getUser);
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
};
const getOrderForCustomer = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getUser1 = await User.findOne({ _id: { $eq: id } });
  let phone;
  if (getUser1) {
    phone = getUser1.phone;
  }
  const getUser2 = await ShopUser.findOne({ _id: { $eq: id } });
  if (getUser2) {
    phone = getUser2.phone;
  }
  const getUser3 = await Customer.findOne({ _id: { $eq: id } });
  if (getUser3) {

    phone = getUser3.phone;
  }
  let getOrder = await Order.find({
    $and: [{ phone: phone }, { paymentStatus: 2 }],
  });
  console.log(id);
 

  if (getOrder) {
    return res.status(200).json({getOrder:getOrder})
  } else {
    return res.status(400).json({ meassge: "Order Not Found" })
  }
};


//  add deliveryBoy in order by shop user
const addDeliveryBoy = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const addDeliveryBoy = await Order.updateOne(
      { shopUser: { $eq: id } },
      {
        $set: {
          AlldeliveryBoy: req.body.deliveryBoy
        },
      },
      { new: true }
    );
    if (addDeliveryBoy) {
    return  res.status(200).json({ message:"Request send to near by delivery boy" });
    }
  else {
      return res.status(400).json({message:"Request send to near by delivery boy Failed!"});
    }
  } catch (err) {
 return res.status(500).json({message:"Something went wrong"})
  }

}
// order for deleveryBoy
const getOrderForDeliveryBoy = async (req, res) => {
  try {
    // const { deliveryBoy } = req.body;
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getOrder = await ProductOrder.find({
      $and: [{ AlldeliveryBoy: id },{deliveryStatus:'Out for Delivery'}],
    });
    if (getOrder !== null) {
     return  res.status(200).json(getOrder);
    }else{
      return res.status(400).json({menubar:"didn't find any order"})
    }
  } catch (err) {
    console.log(err);
 return res.status(500).json({message:"Something went wrong"})

  }
};
// order accept by delivery body
const acceptOrderByDeliveryBoy = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const acceptOrderByDeliveryBoy = await Order.updateOne(
      { AlldeliveryBoy: { $eq: id } },
      {
        $set: {
          acceptDeliveryBoy: id,
        },
      },
      { new: true }
    );
    if (acceptOrderByDeliveryBoy) {
    return  res.status(200).json({ message:"order accept by delivery boy" });
    }
  else {
      return res.status(400).json({message:"Order accept fail by delivery boy Failed!"});
    }
  } catch (err) {
 return res.status(500).json({message:"Something went wrong"})
  }

}

module.exports = {
  createOrder,
  getOrderByPhone,
  getOrderById,
  getAuthOrderById,
  updateShopOrderStatus,
  getOrderProduct,
  updateShopOrder,
  createPaymentOrder,
  deliveryProviderUser,
  getOrderForCustomer,
  updateDeliveryStatus,
  addDeliveryBoy,
  getOrderForDeliveryBoy,
  acceptOrderByDeliveryBoy
};
