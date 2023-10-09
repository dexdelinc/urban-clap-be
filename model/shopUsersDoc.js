const mongoose = require("mongoose");
const moment = require("moment");
// require('./user')
require("../model/shopUser");
const UserSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,

    shopUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopUser",
      require: true,
    },

    // image: {
    //   data: Buffer,
    //   contentType: String,
    // },
    imagePath: [
      { type: String }
    ], 
    type: { type: String },
    
    isVerify: {
      type: Boolean,
      default: false
    }
  },
  
  { timestamps: { currentTime: () => moment.utc().format() } }
);
const serviceUsersDoc = mongoose.model("ShopDoc", UserSchema);
module.exports = serviceUsersDoc;
