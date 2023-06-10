const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionTypeSchema = new Schema({
  name: { type: String, require: true },
});

module.exports = mongoose.model("TransactionType", transactionTypeSchema);