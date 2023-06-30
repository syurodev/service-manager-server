const orderSchema = require("../app/models/Order")
const contractSchema = require("../app/models/Contract")
const commoditySchema = require("../app/models/Commodity")

async function generateCode({ type }) {
  console.log(type)
  let orderCode;
  let isDuplicate = true;

  while (isDuplicate) {
    orderCode = generateUniqueCode(type); // Tạo orderCode mới

    if (type === "DH") {
      const existingOrder = await orderSchema.findOne({ madh: orderCode });

      if (!existingOrder) {
        isDuplicate = false; // Không trùng, thoát khỏi vòng lặp
      }
    }

    if (type = "HD") {
      const existingOrder = await contractSchema.findOne({ mahd: orderCode });

      if (!existingOrder) {
        isDuplicate = false; // Không trùng, thoát khỏi vòng lặp
      }
    }

    if (type = "HH") {
      const existingOrder = await commoditySchema.findOne({ mahh: orderCode });

      if (!existingOrder) {
        isDuplicate = false; // Không trùng, thoát khỏi vòng lặp
      }
    }
  }

  return orderCode;
}

function generateUniqueCode(type) {
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const formattedString = `${year}-${month}-${day}`;

  const randomDigits = Math.floor(Math.random() * 10000);
  const orderCode = `${type}-${formattedString}-${randomDigits}`;
  return orderCode;
}

module.exports = generateCode