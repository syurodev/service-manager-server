const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionStatusSchema = new Schema({
  name: { type: String, require: true },
});

module.exports = mongoose.model("TransactionStatus", transactionStatusSchema);