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

        const commodity = await commoditySchema.findById(hanghoa);

        if (!commodity) {
          return res.status(400).json({ message: 'Hàng hoá không tồn tại' });
        }

        if (commodity.soluongtrongkho < soluong) {
          return res.status(400).json({ message: 'Không đủ số lượng hàng hoá trong kho' });
        }

        const orderItem = orderItemSchema({
          hanghoa,
          soluong,
          chietkhau
        });

        const savedOrderItem = await orderItem.save();
        order.items.push(savedOrderItem._id);

        await commoditySchema.findByIdAndUpdate(hanghoa, { $inc: { soluongtrongkho: -soluong } });
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

  //[GET] /api/order/:id
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `order${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const order = await orderSchema.findById(_id)
        .populate("nhanvien", "hoten")
        .populate("khachhang", "name")
        .populate({
          path: 'items',
          populate: {
            path: 'hanghoa',
            model: 'Commodity',
            select: 'name'
          },
          select: 'soluong chietkhau'
        });

      if (order) {
        const formattedOrder = {
          nhanvien: order.nhanvien.hoten,
          khachhang: order.khachhang.name,
          items: order.items.map((item) => ({
            tenhh: item.hanghoa.name,
            soluong: item.soluong,
            chietkhau: item.chietkhau
          }))
        };

        req.cache.set(cacheKey, formattedOrder);
        res.status(201).json({ order: formattedOrder })
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" })
      }
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

        const cacheKey = `order${_id}`;
        req.cache.del(cacheKey);

        res.status(201).json({
          message: "Thay đổi thông tin đơn hàng thành công"
        })
      } else {
        res.status(404).json({ message: "Không tìm thấy thông tin đơn hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Eror" })
    }
  }

  //[PATCH] /api/order/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(401).json({ message: "Thiếu dữ liệu để thực hiện thao tác xoá" })
      }

      const order = await orderSchema.findById(_id)

      if (order) {
        order.deleted = true
        order.deleteBy = staffid
        order.deleteAt = Date.now()

        await order.save()

        res.status(201).json({ message: "Đơn hàng đã được chuyển đến thùng rác" })
      } else {
        res.status(501).json({ message: "Không tìm thấy đơn hàng" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/order/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const order = await orderSchema.findById(_id)

      if (order) {
        order.deleted = false
        order.deleteBy = null
        order.deleteAt = null

        await order.save()
        res.status(201).json({ message: "Khôi phục thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[DELETE] /api/order/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;
      const result = await orderSchema.deleteOne({ _id });

      if (result.deletedCount === 1) {
        const cacheKey = `order${_id}`;
        req.cache.del(cacheKey);
        res.status(204).json({ message: "Xoá đơn hàng thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
module.exports = new OrderController()