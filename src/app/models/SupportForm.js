const mongoose = require("mongoose");
const { Schema } = mongoose;

const supportFormTypeSchema = new Schema({
  title: { type: String, require: true },
  noidung: { type: String, require: true },
  sdt: { type: String },
  cccd: { type: Number },
  shd: { type: String },
  trangthai: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
  khachhang: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
});

module.exports = mongoose.model("SupportFormType", supportFormTypeSchema);