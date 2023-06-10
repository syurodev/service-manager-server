const mongoose = require("mongoose");
const { Schema } = mongoose;

const wardsSchema = new Schema({
  name: { type: String, require: true },
  code: { type: Number, require: true },
  district_code: { type: Number, require: true },
  district: { type: mongoose.Schema.Types.ObjectId, ref: "Districts" },
});

module.exports = mongoose.model("Wards", wardsSchema);