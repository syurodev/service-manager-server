const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerTypeSchema = new Schema({
  name: { type: String, require: true },
  mota: { type: String, default: "" },
});

module.exports = mongoose.model("CustomerType", customerTypeSchema);