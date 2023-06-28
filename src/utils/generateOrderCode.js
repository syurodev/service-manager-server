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
  const randomDigits = Math.floor(Math.random() * 10000);
  const orderCode = `DH-${timestamp}-${randomDigits}`;
  return orderCode;
}

module.exports = generateOrderCode