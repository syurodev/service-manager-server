const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  madh: { type: String },
  ngaybatdau: { type: Date },
  ngayketthuc: { type: Date },
  deleted: { type: Boolean, default: false },
  deleteAt: { type: Date, default: null },
  deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  khachhang: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }]
});

module.exports = mongoose.model("Order", orderSchema);
