const mongoose = require("mongoose");

const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/OrderItem")
const customerSchema = require("../models/Customer")
const commoditySchema = require("../models/Commodity")
const contractSchema = require("../models/Contract")

const mailer = require("../../utils/mailer")
const generateCode = require("../../utils/generateCode")

class OrderController {
  //[POST] /api/order/create
  async create(req, res) {
    try {
      const { ngaybatdau, ngayketthuc, nhanvien, orderItems, khachhang } = req.body;

      const madh = await generateCode({ type: "DH" })

      const order = orderSchema({
        madh,
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

      const customer = await customerSchema.findById(khachhang, "name email")

      if (customer?.email) {
        const itemsListPromises = orderItems.map(async (item) => {
          const commodity = await commoditySchema.findById(item.hanghoa);
          return `<li>Tên hàng hoá: ${commodity.name}, số lượng: ${item.soluong}</li>`;
        });

        const itemsList = await Promise.all(itemsListPromises);

        mailer.sendMail(customer.email, "Cảm ơn bạn đã đặt hàng!", `
        <!DOCTYPE html>
          <html>
          <head>
            <title>Cảm ơn bạn đã đặt hàng!</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }

              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }

              h1 {
                font-size: 24px;
                margin-bottom: 20px;
              }

              p {
                font-size: 16px;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Cảm ơn bạn đã đặt hàng!</h1>
              <p>Xin chào ${customer.name},</p>
              <p>Cảm ơn bạn đã đặt hàng của chúng tôi. Chúng tôi rất trân trọng sự tin tưởng và hỗ trợ của bạn.</p>
              <p>Chi tiết đơn hàng của bạn:</p>
              <p>Mã đơn hàng: ${order.madh}</p>
              <p>Danh sách hàng hoá: </p>
              <ul>
                ${itemsList.join('')}
              </ul>
              <p>Chúng tôi sẽ xử lý đơn hàng của bạn càng sớm càng tốt. Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu đặc biệt nào, vui lòng liên hệ với chúng tôi.</p>
              <p>Xin cảm ơn một lần nữa!</p>
              <p>Trân trọng,</p>
              <p>Đội ngũ của chúng tôi</p>
            </div>
          </body>
          </html>
        `)
      }

      await order.save();

      res.status(201).json({ message: "Thêm đơn hàng thành công" });
    } catch (error) {
      console.log(error)
      res.status(500).json("Internal Server Error", error)
    }
  }

  //[GET] /api/order/
  async get(req, res) {
    try {
      const { limit = 15, sort = "createAt", page = 1, nhanvien = null, deleted = false, khachhang = null, mini = false, q = "", role = "" } = req.query
      const query = { deleted: deleted }


      if (q) {
        query.madh = { $regex: q }
      }

      if (role === "Nhân viên") {
        query.nhanvien = nhanvien
      }

      if (nhanvien && mini === false) {
        query.nhanvien = nhanvien
      }

      if (khachhang) {
        query.khachhang = khachhang
      }

      if (mini) {
        const existingOrders = await contractSchema.find({}, "donhang")
        const existingOrderIds = existingOrders.map(order => order.donhang);

        if (existingOrderIds) {
          query._id = { $nin: existingOrderIds }
        }

        const orders = await orderSchema.find(query, "madh");

        res.status(201).json({
          orders
        })
      } else {
        const count = await orderSchema.countDocuments(query)
        const totalPages = Math.ceil(count / limit);
        const skip = (page - 1) * limit;

        let currentPage = page ? parseInt(page) : 1;
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }

        const orders = await orderSchema.find(query, "madh items")
          .populate("nhanvien", "hoten")
          .populate("khachhang", "name")
          .limit(limit)
          .sort(sort)
          .skip(skip)

        const modifiedOrders = orders.map((order) => ({
          _id: order._id,
          madh: order.madh,
          nhanvien: order.nhanvien,
          khachhang: order.khachhang,
          orderItemCount: order.items.length,
        }));

        res.status(201).json({
          total: count,
          currentPage: page,
          totalPages,
          orders: modifiedOrders
        })
      }

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
      req.cache.del(cacheKey);


      // const cachedData = req.cache.get(cacheKey);

      // if (cachedData) {
      //   return res.status(201).json(cachedData);
      // }

      const order = await orderSchema.findById(_id)
        .populate("nhanvien", "hoten")
        .populate("khachhang", "name")
        .populate({
          path: 'items',
          populate: {
            path: 'hanghoa',
            model: 'Commodity',
            select: 'name giabanra thue'
          },
          select: 'soluong chietkhau'
        });

      if (order) {
        const formattedOrder = {
          nhanvien: {
            _id: order.nhanvien._id,
            hoten: order.nhanvien.hoten
          },
          khachhang: {
            _id: order.khachhang._id,
            name: order.khachhang.name,
          },
          items: order.items.map((item) => {
            const tongtien = (item.hanghoa.giabanra + item.hanghoa.thue) * item.soluong * (1 - item.chietkhau);
            return {
              _id: item._id,
              tenhh: item.hanghoa.name,
              giabanra: item.hanghoa.giabanra,
              thue: item.hanghoa.thue,
              soluong: item.soluong,
              chietkhau: item.chietkhau,
              tongtien: tongtien
            };
          })
        };

        const totalAmount = formattedOrder.items.reduce((total, item) => {
          return total + item.tongtien;
        }, 0);

        formattedOrder.thanhtien = totalAmount;

        //req.cache.set(cacheKey, formattedOrder);
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
        return res.status(201).json({ message: "Thiếu dữ liệu để thực hiện thao tác xoá" })
      }

      const contract = await contractSchema.findOne({ donhang: _id })

      if (contract) {
        return res.status(201).json({ message: "Đơn hàng này đã có hợp đồng không thể xoá" })
      }

      const order = await orderSchema.findById(_id)

      if (order) {
        order.deleted = true
        order.deleteBy = staffid
        order.deleteAt = Date.now()

        await order.save()

        res.status(201).json({ message: "Đơn hàng đã được chuyển đến thùng rác" })
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" })
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
      const order = await orderSchema.findById(_id);

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      await orderItemSchema.deleteMany({ _id: { $in: order.items } });

      const result = await orderSchema.deleteOne({ _id });

      if (result.deletedCount === 1) {
        const cacheKey = `order${_id}`;
        req.cache.del(cacheKey);
        res.status(201).json({ message: "Xoá đơn hàng thành công" });
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