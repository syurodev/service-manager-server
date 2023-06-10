const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderItemSchema = new Schema({
  hanghoa: { type: mongoose.Schema.Types.ObjectId, ref: "Commodity" },
  soluong: { type: Number, default: 0 },
  chietkhau: { type: Number, default: 0 }
});

const orderSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  ngaybatdau: { type: Date },
  ngayketthuc: { type: Date },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  items: [orderItemSchema]
});

module.exports = mongoose.model("Order", orderSchema);
