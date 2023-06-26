const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerSchema = new Schema({
  name: { type: String, require: true },
  diachivp: { type: String, default: "" },
  sdt: { type: Number },
  email: { type: String, default: "" },
  masothue: { type: String, default: "" },
  mota: { type: String, default: "" },
  website: { type: String, default: "" },
  ngaytaokh: { type: Date, default: Date.now },
  thongtinkhac: { type: String, default: "" },
  stk: { type: Number, default: 0 },
  nguoidaidien: { type: String, default: "" },
  createAt: { type: Date, default: Date.now },
  sdtndd: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  deleteAt: { type: Date },
  deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  loaikhachhang: { type: mongoose.Schema.Types.ObjectId, ref: "CustomerType" },
  tinh: { type: mongoose.Schema.Types.ObjectId, ref: "Provinces" },
  phuong: { type: mongoose.Schema.Types.ObjectId, ref: "Districts" },
  xa: { type: mongoose.Schema.Types.ObjectId, ref: "Wards" },
  chucvundd: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  nguoilienhe: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
});

module.exports = mongoose.model("Customer", customerSchema);