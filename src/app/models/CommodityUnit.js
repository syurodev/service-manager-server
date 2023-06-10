const mongoose = require("mongoose");
const { Schema } = mongoose;

const commodityUnitSchema = new Schema({
  dvt: { type: String, require: true },
});

module.exports = mongoose.model("CommodityUnit", commodityUnitSchema);