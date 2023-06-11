const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/OrderItem")

class OrderController {
  async create(req, res) {
    try {
      const { ngaybatdau, ngayketthuc, nhanvien, orderItems } = req.body;

      const order = orderSchema({
        ngaybatdau,
        ngayketthuc,
        nhanvien,
        items: []
      });

      for (const orderItemData of orderItems) {
        const { hanghoa, soluong, chietkhau } = orderItemData;

        const orderItem = orderItemSchema({
          hanghoa,
          soluong,
          chietkhau
        });

        const savedOrderItem = await orderItem.save();
        order.items.push(savedOrderItem._id);
      }

      await order.save();

      res.status(201).json({ message: "Thêm đơn hàng thành công" });
    } catch (error) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }
}
module.exports = new OrderController()