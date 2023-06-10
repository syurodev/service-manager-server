const mongoose = require("mongoose");
const { Schema } = mongoose;

const commodityTypeSchema = new Schema({
  loaihh: { type: String, require: true },
  mota: { type: String },
});

module.exports = mongoose.model("CommodityType", commodityTypeSchema);