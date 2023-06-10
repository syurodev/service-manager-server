const mongoose = require("mongoose");
const { Schema } = mongoose;

const districtsSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
  code: { type: number, require: true },
  province_code: { type: number, require: true },
  province: { type: mongoose.Schema.Types.ObjectId, ref: "Provinces" },
});

module.exports = mongoose.model("Districts", districtsSchema);