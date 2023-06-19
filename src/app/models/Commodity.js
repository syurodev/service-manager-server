const mongoose = require("mongoose");
const { Schema } = mongoose;

const commoditySchema = new Schema({
  mahh: { type: String, require: true },
  name: { type: String, require: true },
  image: { type: String, default: "" },
  gianhap: { type: Number, default: 0 },
  giabanra: { type: Number, default: 0 },
  mota: { type: String, default: "" },
  thue: { type: Number, default: 0 },
  trangthai: { type: Number, default: 0 },
  soluongtrongkho: { type: Number, default: 1 },
  deleted: { type: Boolean, default: false },
  deleteAt: { type: Date },
  deleteBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  dvt: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommodityUnit" }],
  loaihh: { type: mongoose.Schema.Types.ObjectId, ref: "CommodityType" },
});

module.exports = mongoose.model("Commodity", commoditySchema);