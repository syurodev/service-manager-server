const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionStatusSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
});

module.exports = mongoose.model("TransactionStatus", transactionStatusSchema);