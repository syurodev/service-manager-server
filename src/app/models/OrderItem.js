const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  hanghoa: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity" },
  soluong: { type: Number, default: 0 },
  chietkhau: { type: Number, default: 0 }
});

module.exports = mongoose.model("OrderItem", orderItemSchema);
