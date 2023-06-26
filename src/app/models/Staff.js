const mongoose = require("mongoose");
const { Schema } = mongoose;

const staffSchema = new Schema({
  hoten: { type: String, require: true },
  email: { type: String, default: "" },
  sdt: { type: Number, require: true },
  ngaysinh: { type: Date },
  ngayvaolam: { type: Date, default: Date.now },
  cccd: { type: Number, require: true },
  createAt: { type: Date, default: Date.now },
  phongban: { type: String, default: "" },
  chucvu: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
  tinh: { type: mongoose.Schema.Types.ObjectId, ref: "Provinces" },
  phuong: { type: mongoose.Schema.Types.ObjectId, ref: "Districts" },
  xa: { type: mongoose.Schema.Types.ObjectId, ref: "Wards" },
});

module.exports = mongoose.model("Staff", staffSchema);