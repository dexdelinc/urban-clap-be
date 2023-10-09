const mongoose = require("mongoose");
const moment = require('moment');

const ShopProductSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,

    name: { type: String, default: null },
    price: { type: Number },
    basePrice: { type: Number },
    quantity: { type: Number },
    description: { type: String },
    // image: {
    //   data: Buffer,
    //   contentType: String,
    // },
    imagePath: { type: String },
    shop: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        require: true,
        multi: true,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
      multi: true,
    },
    status: { type: Number, default: 1 },
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);

// status=1 mean product exist
// status=0 mean product not exist

const ShopProduct= mongoose.model("ShopProduct", ShopProductSchema);
module.exports = ShopProduct