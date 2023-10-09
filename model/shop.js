const mongoose = require("mongoose");
const ShopSchema = new mongoose.Schema({
  name: { type: String, default: null },
  status: { type: Number, default: 1 },
 
  
  
});
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
// });
const Shop= mongoose.model("Shop", ShopSchema);
module.exports = Shop