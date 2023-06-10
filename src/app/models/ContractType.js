const mongoose = require("mongoose");
const { Schema } = mongoose;

const contractTypeSchema = new Schema({
  loaihd: { type: String, require: true },
  mota: { type: String, default: "" },
});

module.exports = mongoose.model("ContractType", contractTypeSchema);