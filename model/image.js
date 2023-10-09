const mongoose = require("mongoose");
const ImageSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
    phone: { type: Number, default: null },
    type: {type: String},
  image: {
    data: Buffer,
    contentType: String,
  },
});

const Image = mongoose.model("Image", ImageSchema);
module.exports = Image;
