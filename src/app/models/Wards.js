const mongoose = require("mongoose");
const { Schema } = mongoose;

const wardsSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
  code: { type: number, require: true },
  district_code: { type: number, require: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: "Districts" },
});

module.exports = mongoose.model("Wards", wardsSchema);