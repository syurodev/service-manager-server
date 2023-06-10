const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
  id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, require: true },
  sdt: { type: Number, default: 0 },
  email: { type: String, default: "" },
  ngaysinh: { type: Date },
  gioitinh: { type: String },
  lienhechinh: { type: Boolean, default: false },
  trangthai: { type: String, default: "Làm việc" },
  chucvu: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
});

module.exports = mongoose.model("Contact", contactSchema);