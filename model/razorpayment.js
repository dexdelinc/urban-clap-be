const mongoose = require("mongoose");
const moment = require('moment');

const razorSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    response: {},
    status: { type: Number, default: 1 },
    user:mongoose.Schema.Types.ObjectId,
    usertype: { type: String },
    enddate:{type:Date}
},
{ timestamps: {currentTime: () => moment.utc().format()} });
const RazorPayment = mongoose.model("razorPayment", razorSchema);
module.exports = RazorPayment;