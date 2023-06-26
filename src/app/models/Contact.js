const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
  name: { type: String, require: true },
  sdt: { type: Number, default: null },
  email: { type: String, default: null },
  ngaysinh: { type: Date },
  gioitinh: { type: String },
  lienhechinh: { type: Boolean, default: false },
  trangthai: { type: String, default: "Làm việc" },
  deleted: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
  deleteAt: { type: Date },
  deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  chucvu: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
});

module.exports = mongoose.model("Contact", contactSchema);