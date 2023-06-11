const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/OrderItem")

class OrderController {
  //[POST] /api/order/create
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

  //[GET] /api/order/
  async get(req, res) {
    try {
      const { limit = 15, sort = "ngayketthuc", page = 1, nhanvien = null, deleted = false } = req.query
      const query = { deleted: deleted }

      if (nhanvien) {
        query.nhanvien = { $regex: nhanvien }
      }

      const count = await orderSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const orders = await orderSchema.find(query, "ngaybatdau ngayketthuc items")
        .populate("nhanvien", "hoten")
        .limit(limit)
        .sort(sort)
        .skip(skip)

      const modifiedOrders = orders.map((order) => ({
        _id: order._id,
        ngaybatdau: order.ngaybatdau,
        ngayketthuc: order.ngayketthuc,
        nhanvien: order.nhanvien,
        orderItemCount: order.items.length,
      }));

      res.status(201).json({
        total: count,
        currentPage: page,
        totalPages,
        orders: modifiedOrders
      })

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

}
module.exports = new OrderController()