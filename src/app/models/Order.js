const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  ngaybatdau: { type: Date },
  ngayketthuc: { type: Date },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }]
});

module.exports = mongoose.model("Order", orderSchema);
