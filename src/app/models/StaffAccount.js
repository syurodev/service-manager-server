const mongoose = require("mongoose");
const { Schema } = mongoose;

const staffAccountSchema = new Schema({
  username: { type: String, require: true },
  createAt: { type: Date, default: Date.now },
  password: { type: String, require: true },
  role: { type: String, default: "nhanvien" },
  nhanvien: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
});

module.exports = mongoose.model("StaffAccount", staffAccountSchema);