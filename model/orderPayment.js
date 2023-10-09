const mongoose = require("mongoose");
const moment = require("moment");
require("../model/customer");
require("../model/order");

const razorSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    response: {},
    paymentStatus: { type: Number, default: 1 },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      require: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      require: true,
    },
    usertype: { type: String },
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);
const OrderPayment = mongoose.model("OrderPayment", razorSchema);
module.exports = OrderPayment;
