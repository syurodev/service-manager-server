const orderSchema = require("../app/models/Order")

async function generateOrderCode() {
  let orderCode;
  let isDuplicate = true;

  while (isDuplicate) {
    orderCode = generateUniqueCode(); // Tạo orderCode mới

    const existingOrder = await orderSchema.findOne({ madh: orderCode });

    if (!existingOrder) {
      isDuplicate = false; // Không trùng, thoát khỏi vòng lặp
    }
  }

  return orderCode;
}

function generateUniqueCode() {
  const timestamp = Date.now();
  const day = timestamp.getUTCDate();
  const month = timestamp.getUTCMonth() + 1;
  const year = timestamp.getUTCFullYear();
  const formattedString = `${day}-${month}-${year}`;

  const randomDigits = Math.floor(Math.random() * 10000);
  const orderCode = `DH-${formattedString}-${randomDigits}`;
  return orderCode;
}

module.exports = generateOrderCode