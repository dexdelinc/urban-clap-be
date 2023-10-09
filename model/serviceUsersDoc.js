const mongoose = require("mongoose");
const moment = require("moment");
// require('./user')
require('../model/user')
const UserSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,
  

    serviceUserId: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
      },
    
    
    // image: {
    //   data: Buffer,
    //   contentType: String,
    // },
    imagePath: [{ type: String }],
    type: { type: String },
    

  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);
const serviceUsersDoc = mongoose.model("ServiceDoc", UserSchema);
module.exports = serviceUsersDoc;