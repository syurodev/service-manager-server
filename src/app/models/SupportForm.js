const mongoose = require("mongoose");
const { Schema } = mongoose;

const supportFormTypeSchema = new Schema({
  title: { type: String, require: true },
  noidung: { type: String, require: true },
  ngaytao: { type: Date, default: Date.now },
  khachhang: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
});

module.exports = mongoose.model("SupportFormType", supportFormTypeSchema);