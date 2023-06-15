const mongoose = require("mongoose");

const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/OrderItem")

class OrderController {
  //[POST] /api/order/create
  async create(req, res) {
    try {
      const { ngaybatdau, ngayketthuc, nhanvien, orderItems, khachhang } = req.body;

      const order = orderSchema({
        ngaybatdau,
        ngayketthuc,
        nhanvien,
        khachhang,
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
      const { limit = 15, sort = "ngayketthuc", page = 1, nhanvien = null, deleted = false, khachhang = null } = req.query
      const query = { deleted: deleted }

      if (nhanvien) {
        query.nhanvien = { $regex: nhanvien }
      }

      if (khachhang) {
        query.khachhang = { $regex: khachhang }
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

  //[PATCH] /api/order/edit
  async edit(req, res) {
    try {
      const { _id, ngaybatdau, ngayketthuc, nhanvien, orderItems } = req.body;

      const order = await orderSchema.findById(_id)

      if (order) {
        if (order.nhanvien.toString() !== nhanvien) {
          return res.status(401).json({ message: "Nhân viên này không được phép sửa thông tin đơn hàng" })
        }

        const newOrder = orderSchema({
          ngaybatdau,
          ngayketthuc,
          nhanvien,
          items: []
        });

        for (const orderItemData of orderItems) {
          if (orderItemData?._id && mongoose.Types.ObjectId.isValid(orderItemData?._id)) {
            newOrder.items.push(orderItemData?._id);
          } else {
            const { hanghoa, soluong, chietkhau } = orderItemData;

            const orderItem = orderItemSchema({
              hanghoa,
              soluong,
              chietkhau
            });

            const savedOrderItem = await orderItem.save();
            newOrder.items.push(savedOrderItem._id);
          }
        }

        order.ngaybatdau = newOrder.ngaybatdau
        order.ngayketthuc = newOrder.ngayketthuc
        order.items = newOrder.items

        await order.save()

        res.status(201).json({
          message: "Thay đổi thông tin đơn hàng thành công",
          order
        })
      } else {
        res.status(404).json({ message: "Không tìm thấy thông tin đơn hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Eror" })
    }
  }
}
module.exports = new OrderController()