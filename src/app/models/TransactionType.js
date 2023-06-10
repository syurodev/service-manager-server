const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionTypeSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
});

module.exports = mongoose.model("TransactionType", transactionTypeSchema);