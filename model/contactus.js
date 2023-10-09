const mongoose = require("mongoose");
const ContactusSchema = new mongoose.Schema({
  name: { type: String, default: null },
  phone: { type: Number, default: null },
  email: {  type: String,
    trim: true,
    lowercase: true,
    required: true,
    index: {
      unique: true,
    }, },
query:{type:String,default:null}

 
  
  
});

const Contactus= mongoose.model("Contactus", ContactusSchema);
module.exports = Contactus