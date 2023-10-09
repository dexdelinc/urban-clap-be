const mongoose = require("mongoose");
const moment = require('moment');

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number]
  }
});
const orderSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,

    name: { type: String },
    phone: { type: Number },
    email: { type: String },
    item: [
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "ShopProduct",
      //   require: true,
      //   multi: true,
      // },
    ],
    orderItemPrice: [],
    // orderItemList: [],
    totalPrice: { type: Number },
    totalProduct: { type: Number },
    shopProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopProduct",
        require: true,
        multi: true,
      },
    ],
    shopUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopUser",
      require: true,
      multi: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
    },
    location: {
      type: geoSchema,
      index: "2dsphere",
    },
    address: { type: String },
    status: { type: Number, default: 1 },
    paymentStatus: { type: Number, default: 1 },
    statusbar: { type: String, default: "Pending" },
    deliveryStatus:{type:String,default:"Ready for Packing"},
    AlldeliveryBoy:{type:Array,default:[]},
    acceptDeliveryBoy:{type:String,default:''},
    shopAddress:{type:String}
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);



const Order = mongoose.model("Order", orderSchema);
module.exports = Order