const mongoose = require("mongoose");
const moment = require('moment');
const OrderUserSchema = new mongoose.Schema({





    
},
{ timestamps: { currentTime: () => moment.utc().format() } });
const OrderUser= mongoose.model("OrderUser", OrderUserSchema);
module.exports = OrderUser