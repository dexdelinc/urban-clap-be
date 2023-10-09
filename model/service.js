const mongoose = require("mongoose");
const ServiceSchema = new mongoose.Schema({
  name: { type: String, default: null },
  status: { type: Number, default: 1 },
 
  
  
});
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
// });
const Service = mongoose.model("Service", ServiceSchema);
module.exports = Service;
