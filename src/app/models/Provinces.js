const mongoose = require("mongoose");
const { Schema } = mongoose;

const provincesSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
  code: { type: number, require: true },
});

module.exports = mongoose.model("Provinces", provincesSchema);