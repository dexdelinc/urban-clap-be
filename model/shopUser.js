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
const ShopUserSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    status: { type: Number, default: 1 },

    phone: { type: Number, default: null, unique: true, require: true },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    rephone: { type: Number, default: null },
    location: {
      type: geoSchema,
      index: "2dsphere",
    },
    deviceToken: { type: Object ,default:null},


    shop: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        require: true,
        multi: true,
      },
    ],
    discription: { type: String, default: null },
    // image: {
    //   data: Buffer,
    //   contentType: String,
    // },
    imagePath: { type: String },
    type: { type: String },
    email: { type: String },
    password: { type: String },
    geo_address: { type: String, default: null },
    shopAvalStatus: { type: Number, default: 2 },
    bankDetails:{type:Object,default:null}
    // token: { type: String },
    // imgUrl:{type:String}
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
// });
const ShopUser = mongoose.model("ShopUser", ShopUserSchema);
module.exports = ShopUser;
