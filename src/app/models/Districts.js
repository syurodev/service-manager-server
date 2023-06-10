const mongoose = require("mongoose");
const { Schema } = mongoose;

const districtsSchema = new Schema({
  name: { type: String, require: true },
  code: { type: Number, require: true },
  province_code: { type: Number, require: true },
  province: { type: mongoose.Schema.Types.ObjectId, ref: "Provinces" },
});

module.exports = mongoose.model("Districts", districtsSchema);