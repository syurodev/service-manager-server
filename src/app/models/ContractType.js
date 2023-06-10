const mongoose = require("mongoose");
const { Schema } = mongoose;

const contractTypeSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  loaihd: { type: String, require: true },
  mota: { type: String, default: "" },
});

module.exports = mongoose.model("ContractType", contractTypeSchema);