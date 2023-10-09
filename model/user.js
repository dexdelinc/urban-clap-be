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


const UserSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    status: { type: Number, default: 1 },
    phone: { type: Number, default: null, unique: true, require: true },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    rephone: { type: Number, default: null },
    address: String,
    deviceToken: { type: Object ,default:null},
    location: {
      type: geoSchema,
      index: "2dsphere",
    },
    tempLocation: {
     type:Object,default:null
    },
    geo_address: { type: String, default: null },
    // type: geoSchema,
    // index: '2dsphere'
    needDelBag:{type:String},
    service: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
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
    serviceAvalStatus: { type: Number, default: 2 },
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
const User = mongoose.model("User", UserSchema);
module.exports = User;
