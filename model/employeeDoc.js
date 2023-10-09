const mongoose = require("mongoose");
const moment = require("moment");
// require('./user')
require("../model/employee");
const EmployeeSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
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
const EmployeeDoc = mongoose.model("EmployeeDoc", EmployeeSchema);
module.exports = EmployeeDoc;
