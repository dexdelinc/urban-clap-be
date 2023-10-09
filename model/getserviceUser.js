const mongoose = require("mongoose");
const moment = require('moment');

const getserviceUserSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  name: { type: String, require, default: null },
  phone: { type: Number, require },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  },
},
{ timestamps: {currentTime: () => moment.utc().format()} });
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
// });
const getserviceUser = mongoose.model("getserviceUser", getserviceUserSchema);
module.exports = getserviceUser;
