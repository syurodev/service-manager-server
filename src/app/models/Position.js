const mongoose = require("mongoose");
const { Schema } = mongoose;

const positionSchema = new Schema({
  name: { type: String, require: true },
});

module.exports = mongoose.model("Position", positionSchema);