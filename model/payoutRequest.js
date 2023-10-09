const mongoose = require("mongoose");
const moment = require('moment');
const { stringify } = require("uuid");
const payoutSchema = new mongoose.Schema(
  {
    // id: mongoose.Schema.Types.ObjectId,

    name: { type: String },
    phone: { type: Number },
    email: { type: String },

    amount: { type: Number },
    bankDetails:{type:Object,default:null},
    shopUser: {
      type: String
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "ShopUser",
      // require: true,
      // multi: true,
    },
    payoutRequestStatus:{type:String,}
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);



const PayoutRequest = mongoose.model("PayoutRequest", payoutSchema);
module.exports = PayoutRequest