require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../model/user");
const Service = require("../../model/service");
const cors = require("cors");
const body_parser = require("body-parser");
const Razorpay = require("razorpay");
let axios = require("axios");
require("dotenv").config();
const app = express();
const https = require('https');
// const PaytmChecksum = require('paytmChecksum');

const Stripe = require("stripe");
const { json } = require("body-parser");
let publishableKeySecret = process.env.publishableKeySecret

const stripe = Stripe("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");
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());
const instance = new Razorpay({
  // client account key
  // key_id:"rzp_test_nWQ8aWt5I8GrCt",
  // key_secret:"26qKueto9iU2eJHk92bUzcDs",

  // my account kkey
  // key_id:"rzp_test_DcaB0F33pE7sHt",
  // key_secret:"W0HcKALJw5ql7QzMoaSGIZMK"

  // Live key rzp_live_iNGX6DhXWcDzcl  Y6kbh0fiNnL4VomeGRjG0jIH

  key_id: "rzp_live_iNGX6DhXWcDzcl",
  key_secret: "Y6kbh0fiNnL4VomeGRjG0jIH",
});

const createOrder = async (req, res) => {
  var options = {
    amount: 73000,
    currency: "INR",
  };
  instance.orders.create(options, (err, order) => {
    res.send(order);
  });
};

const createOrderPay = async (req, res) => {
  const { totalAmount } = req.body;
  console.log(totalAmount);

  var options = {
    amount: 100,
    currency: "INR",
  };

  instance.orders.create(options, (err, order) => {
    res.send(order);
  });
};

const paymentSheet = async (req, res, next) => {
  try {
    const data = req.body;
    const params = {
      email: data.email,
      name: data.name,
    };
    const customer = await stripe.customers.create(params);
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2020-08-27" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(data.amount),
      currency: data.currency,
      customer: customer.id,
    });
    const response = {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    };
    console.log(response);

    res.status(200).send(response);
  } catch (err) {
    next(err);
  }
};
const createPayout = async (req, res) => {
  const payout = await stripe.payouts.create({
    amount: 1100,
    currency: "usd",
  });
  const payout1 = await stripe.payouts.retrieve(payout.id);
};

const cashFree = async (req, res) => {
  let url = "https://sandbox.cashfree.com/pg/orders";
  try {
    var val = Math.floor(1000 + Math.random() * 9000);
    axios
      .post(
        url,
        {
          order_id: "Order" + val,
          order_amount: req.body.orderAmount,
          order_currency: req.body.orderCurrency,
          customer_details: {
            customer_id: "customer_id",
            customer_name: "customer_name",
            customer_email: "dev@dev.com",
            customer_phone: "7814053798",
          },
        },
        {
          headers: {
            "x-client-id": "TEST338563fe9455c397c30ee4a56a365833",
            "x-client-secret": "TESTe2ee1f352bb7b87f49a0c0d7ee122ec16f3cf683",
            "x-api-version": "2022-09-01",
            "x-request-id": "Pardeep Singh",
          },
        }
      )
      .then(function (response) {
        console.log(response.data);
        let order_id = response.data.order_id;
        let payment_session_id = response.data.payment_session_id;
        // res.status(201).json(response.data);
        const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders/sessions",
          data: {
            payment_method: {
              upi: {
                channel: 'link', provider: 'gpay', phone: '9675419281'
              },
            },
            payment_session_id: payment_session_id,
          },
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-client-id": "TEST338563fe9455c397c30ee4a56a365833",
            "x-client-secret": "TESTe2ee1f352bb7b87f49a0c0d7ee122ec16f3cf683",
            "x-api-version": "2022-09-01",
          },
        };
        axios
          .request(options)
          .then(function (response) {
            console.log(response.data);
        res.status(201).json(response.data);

            // const options = {
            //   method: "POST",
            //   data: {action: 'CAPTURE', amount: req.body.orderAmount},
            //   url:
            //     "https://sandbox.cashfree.com/pg/orders/" +
            //     order_id +
            //     "/authorization",
            //   headers: {
            //     accept: "application/json",
            //     "content-type": "application/json",
            //     "x-client-id": "TEST338563fe9455c397c30ee4a56a365833",
            //     "x-client-secret":
            //       "TESTe2ee1f352bb7b87f49a0c0d7ee122ec16f3cf683",
            //     "x-api-version": "2022-09-01",
            //   },
            // };

            // axios
            //   .request(options)
            //   .then(function (response) {
            //     console.log(response.data);
            //   })
            //   .catch(function (error) {
            //     console.error(error);
            //   });
          })
          .catch(function (error) {
            console.error(error);
          });
      });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Something went wrong" });
  }
};

const paytm=async (req,res)=>{

 let paytmParams = {
    "requestType"   : "Payment",
    "mid"           : "DIY12386817555501617",
    "websiteName"   : "Swork7",
    "orderId"       : "ORDERID_98765",
    "callbackUrl"   : "https://smartworkindia7.com",
    "txnAmount"     : {
        "value"     : "1.00",
        "currency"  : "INR",
    },
    "userInfo"      : {
        "custId"    : "CUST_001",
    },
};

PaytmChecksum.generateSignature(JSON.stringify(paytmParams), "bKMfNxPPf_QdZppa").then(function(checksum){

    paytmParams.head = {
        "signature"    : checksum
    };

    var post_data = JSON.stringify(paytmParams);

    var options = { 

        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: '/theia/api/v1/initiateTransaction?mid=DIY12386817555501617&orderId=ORDERID_98765',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    var response = "";
    var post_req = https.request(options, function(post_res) {
        post_res.on('data', function (chunk) {
            response += chunk;
        });

        post_res.on('end', function(){
            console.log('Response: ', response);
        });
    });

    console.log(post_data);
    post_req.write(post_data);
    post_req.end();
});



}

module.exports = { createOrder, createOrderPay, paymentSheet, cashFree,paytm };
