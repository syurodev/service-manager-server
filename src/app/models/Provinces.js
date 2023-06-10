const mongoose = require("mongoose");
const { Schema } = mongoose;

const provincesSchema = new Schema({
  name: { type: String, require: true },
  code: { type: Number, require: true },
});

module.exports = mongoose.model("Provinces", provincesSchema);