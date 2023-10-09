const mongoose = require("mongoose");
const moment = require("moment");

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
  },
  coordinates: {
    type: [Number],
  },
});

const EmployeeSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
    //   status:{type:Number,default:1},
    phone: { type: Number, default: null, unique: true, require: true },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    rephone: { type: Number, default: null },
    address: String,
    location: {
      type: geoSchema,
      index: "2dsphere",
    },
    employeeId: { type: Number },
    geo_address: { type: String, default: null },
    // type: geoSchema,
    // index: '2dsphere'

    //   service:[{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Service",
    //     require:true,
    //     multi:true
    //   }],
    discription: { type: String, default: null },
    email: { type: String },
    password: { type: String },
    deviceToken: { type: Object ,default:null},

    type: { type: String },
    imagePath: { type: String },
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
const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
