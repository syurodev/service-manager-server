const mongoose = require("mongoose");
const { Schema } = mongoose;

const commodityUnitSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  dvt: { type: String, require: true },
});

module.exports = mongoose.model("CommodityUnit", commodityUnitSchema);