const contractSchema = require("../models/Contract")
const contractTypeSchema = require("../models/ContractType")
const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/OrderItem")
const commoditySchema = require("../models/Commodity")
const customerSchema = require("../models/Customer")
const generateCode = require("../../utils/generateCode")

const mailer = require("../../utils/mailer")
const scheduleReminder = require("../../utils/sendReminderEmail")

class ContractController {
  //[POST] /api/contract/create
  async create(req, res) {
    try {
      const { tenhd = "", giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt = 0, sotienconthieu = 0, ngaytt, soquy, xacnhan = false, ghichu = "", guiemail = false, ghichuthuong = "", loaihd, nhanvien, role = "",
        doanhsotinhcho, khachhang, donhang } = req.body

      if (tenhd === "") {
        return res.status(201).json({
          status: false,
          message: "Tên hợp đồng không được bỏ trống"
        })
      }

      if (khachhang === "") {
        return res.status(201).json({
          status: false,
          message: "Vui lòng chọn khách hàng"
        })
      }

      if (donhang === "") {
        return res.status(201).json({
          status: false,
          message: "Vui lòng chọn đơn hàng"
        })
      }

      if (loaihd === "") {
        return res.status(201).json({
          status: false,
          message: "Vui lòng chọn loại hợp đồng"
        })
      }

      if (donhang) {
        const checkOrder = await orderSchema.findById(donhang)

        if (checkOrder && role === "Nhân viên") {
          if (checkOrder.nhanvien.toString() !== nhanvien.toString()) {
            return res.status(201).json({
              status: false,
              message: "Bạn không có quyền tạo hợp đồng với đơn hàng này"
            })
          }
        }

        if (checkOrder) {
          const existingContract = await contractSchema.findOne({ donhang: donhang })
          if (existingContract) {
            return res.status(201).json({
              status: false,
              message: "Đơn hàng đã có hợp đồng"
            })
          }
        }
      }

      const mahd = await generateCode({ type: "HD" })

      const newContractData = new contractSchema({
        tenhd,
        mahd, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt, ngaytt, soquy, xacnhan, ghichu, sotienconthieu, guiemail, ghichuthuong, loaihd, nhanvien,
        doanhsotinhcho, khachhang, donhang
      })

      if (canhbaohh) {
        const customerEmail = await customerSchema.findById(khachhang, "email")
        if (customerEmail.email) {
          scheduleReminder(newContractData)
        } else {
          return res.status(201).json({ message: "Vui lòng thêm email khách hàng trước khi kích hoạt cảnh báo hết hạn" })
        }
      }

      if (guiemail) {
        const customerEmail = await customerSchema.findById(khachhang, "name email")
        if (customerEmail.email) {
          const orderItems = await orderSchema.findById(donhang)

          const itemsListPromises = orderItems.items.map(async (item) => {
            const orderItem = await orderItemSchema.findById(item);
            const commodity = await commoditySchema.findById(orderItem.hanghoa);
            if (commodity) {
              return `
                <tr
                  <td>${commodity.name}</td> 
                  <td>${orderItem.soluong}</td>
                </tr>
                `;
            }
          });

          const itemsList = await Promise.all(itemsListPromises);
          const giatrihopdong = giatrihd.toLocaleString("vi-VN", { style: "currency", currency: "VND" });


          mailer.sendMail(customerEmail.email, "Cảm ơn bạn đã đặt hàng!", `
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

                .tableContent {
                  width: 100%;
                }

                .table {
                  width: 100%;
                }

                thead > tr {
                  background-color: #d8e2dc; 
                }

                th {
                  white-space: nowrap;
                  margin: 0 10px;
                  font-weight: 500;
                  text-align: center;
                  padding: 10px 10px;
                }

                tbody > tr > td {
                  padding: 12px 20px;
                  white-space: nowrap;
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
                <p>Xin chào ${customerEmail.name},</p>
                <p>Cảm ơn bạn đã đặt hàng của chúng tôi. Chúng tôi rất trân trọng sự tin tưởng và hỗ trợ của bạn.</p>
                <p>Chi tiết hợp đồng của bạn:</p>
                <p>Mã hợp đồng: ${mahd}</p>
                <p>Danh sách hàng hoá: </p>
                <p>Giá trị hợp đồng: ${giatrihopdong} </p>
                <p>Ngày bắt đầu hợp đồng: ${ngaybatdau} </p>
                <p>Ngày kết thúc hợp đồng: ${ngayketthuc} </p>
                <div class="tableWrapper">
                  <div class="tableContent">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Tên hàng hoá</th>
                          <th>Số lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                      ${itemsList.join('')}
                        
                      </tbody>
                    </table>
                  </div>
                </div>
                <p>Chúng tôi sẽ xử lý đơn hàng của bạn càng sớm càng tốt. Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu đặc biệt nào, vui lòng liên hệ với chúng tôi.</p>
                <p>Xin cảm ơn một lần nữa!</p>
                <p>Trân trọng,</p>
                <p>Đội ngũ của chúng tôi</p>
              </div>
            </body>
            </html>
          `)
        } else {
          return res.status(201).json({ message: "Vui lòng thêm email khách hàng trước khi kích hoạt gửi email" })
        }

      }

      await newContractData.save()
      res.status(201).json({ status: true, message: "Tạo hợp đồng thành công", contract: newContractData })

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/contract/
  async get(req, res) {
    try {
      const { limit = 15, sort = "createAt", page = 1, nhanvien = null, deleted = false, khachhang = null, loaihd = null } = req.query
      const query = { deleted: deleted }

      if (nhanvien) {
        query.nhanvien = nhanvien
      }

      if (khachhang) {
        query.khachhang = khachhang
      }

      if (loaihd) {
        query.loaihd = loaihd
      }

      const count = await contractSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const contract = await contractSchema.find(query, "mahd tenhd giatrihd")
        .populate("nhanvien", "hoten")
        .populate("loaihd", "loaihd")
        .populate("khachhang", "name")
        .populate("donhang", "madh")
        .limit(limit)
        .sort(sort)
        .skip(skip)

      res.status(201).json({
        total: count,
        currentPage: page,
        totalPages,
        contract
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[GET] /api/contract/:id
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `contract${_id}`;

      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const contract = await contractSchema.findById(_id)
        .populate("nhanvien", "hoten")
        .populate("loaihd", "loaihd")
        .populate("khachhang", "name")
        .populate({
          path: 'donhang',
          model: 'Order',
          select: 'madh',
          populate: {
            path: 'items',
            model: 'OrderItem',
            select: 'soluong chietkhau',
            populate: {
              path: 'hanghoa',
              model: 'Commodity',
              select: 'mahh name giabanra thue'
            },
          },
        });

      if (contract) {
        const formattedContract = {
          _id: contract._id,
          mahd: contract.mahd,
          tenhd: contract.tenhd,
          nhanvien: contract.nhanvien.hoten,
          khachhang: contract.khachhang.name,
          loaihd: {
            loaihd: contract.loaihd.loaihd,
            _id: contract.loaihd._id
          },
          ngaybatdau: contract.ngaybatdau,
          ngayketthuc: contract.ngayketthuc,
          hinhthuctt: contract.hinhthuctt,
          canhbaohh: contract.canhbaohh,
          loaitt: contract.loaitt,
          sotientt: contract.sotientt,
          sotienconthieu: contract.sotienconthieu,
          xacnhan: contract.xacnhan,
          guiemail: contract.guiemail,
          ngaytt: contract.ngaytt,
          soquy: contract.soquy,
          ghichu: contract.ghichu,
          ghichuthuong: contract.ghichuthuong,
          items: contract.donhang?.items.map((item) => {
            const _id = item.hanghoa._id;
            const giabanra = item.hanghoa.giabanra;
            const thue = item.hanghoa.thue;
            const soluong = item.soluong;
            const chietkhau = item.chietkhau;

            // Tính giá trị hàng hoá
            const giaTriHangHoa = (giabanra + giabanra * (thue / 100)) * soluong * (1 - chietkhau / 100);

            return {
              _id,
              tenhh: item.hanghoa.name,
              giabanra,
              thue,
              mahh: item.hanghoa.mahh,
              soluong,
              chietkhau,
              tongtien: giaTriHangHoa,
            };
          })
        };

        // Tính tổng giá trị hợp đồng
        const giatrihopdong = formattedContract.items.reduce((total, item) => total + item.tongtien, 0);

        formattedContract.giatrihopdong = giatrihopdong;
        formattedContract.sotienconlai = giatrihopdong - formattedContract.sotientt;

        //req.cache.set(cacheKey, contract);
        res.status(201).json(formattedContract)
      } else {
        res.status(404).json({ message: "Không tìm thấy người liên hệ" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[POST] /api/contract/type
  async addContractType(req, res) {
    try {
      const { loaihd, mota = "" } = req.body
      const cacheKey = "contracttypes";
      req.cache.del(cacheKey);

      const existingContractType = await contractTypeSchema.find({ loaihd: { $regex: loaihd, $options: "i" } })

      if (existingContractType.length > 0) {
        return res.status(201).json({ message: "Loại hợp đồng đã tồn tại" })
      }

      const newContractType = new contractTypeSchema({
        loaihd,
        mota
      })

      await newContractType.save()

      res.status(201).json({
        message: "Thêm loại hợp đồng thành công",
        newContractType
      })

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/contract/type
  async getContractTypes(req, res) {
    try {
      const cacheKey = `contracttypes`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const result = await contractTypeSchema.find()

      if (result) {
        req.cache.set(cacheKey, result);
        res.status(200).json(result)
      } else {
        res.status(404).json({ message: "Không tìm thấy loại hợp đồng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contract/change-info
  async changeInfo(req, res) {
    try {
      const { _id, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt = 0, sotienconthieu = 0, ngaytt, soquy, xacnhan = false, ghichu = "", guiemail = false, ghichuthuong = "", loaihd, nhanvien,
        doanhsotinhcho, khachhang, donhang, role = null } = req.body

      if (role === "Nhân viên") {
        return res.status(201).json({ status: false, message: "Bạn không có quyền chỉ sửa hợp đồng" })
      }

      const contract = await contractSchema.findById(_id)

      if (contract) {
        const existingContract = await contractSchema.find({ mahd: { $regex: mahd } })

        if (existingContract.length > 0) {
          return res.status(201).json({ message: "Mã hợp đồng đã tồn tại" })
        }

        contract.giatrihd = giatrihd || contract.giatrihd
        contract.ngaybatdau = ngaybatdau || contract.ngaybatdau
        contract.ngayketthuc = ngayketthuc || contract.ngayketthuc
        contract.canhbaohh = canhbaohh || contract.canhbaohh
        contract.hinhthuctt = hinhthuctt || contract.hinhthuctt
        contract.loaitt = loaitt || contract.loaitt
        contract.sotientt = sotientt || contract.sotientt
        contract.sotienconthieu = sotienconthieu || contract.sotienconthieu
        contract.ngaytt = ngaytt || contract.ngaytt
        contract.soquy = soquy || contract.soquy
        contract.xacnhan = xacnhan || contract.xacnhan
        contract.ghichu = ghichu || contract.ghichu
        contract.guiemail = guiemail || contract.guiemail
        contract.ghichuthuong = ghichuthuong || contract.ghichuthuong
        contract.loaihd = loaihd || contract.loaihd
        contract.nhanvien = nhanvien || contract.nhanvien
        contract.doanhsotinhcho = doanhsotinhcho || contract.doanhsotinhcho
        contract.khachhang = khachhang || contract.khachhang
        contract.donhang = donhang || contract.donhang

        await contract.save()
        const cacheKey = `contract${_id}`;
        req.cache.del(cacheKey);

        res.status(201).json({ message: "Chỉnh sửa thông tin hợp đồng thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy thông tin hợp đồng thành công" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contract/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(401).json("Thiếu dữ liệu để thực hiện thao tác xoá")
      }

      const contract = await contractSchema.findById(_id)

      if (contract) {
        contract.deleted = true
        contract.deleteBy = staffid
        contract.deleteAt = Date.now()

        await contract.save()
        res.status(201).json({ message: "Hợp đồng đã được chuyển đến thùng rác" })
      } else {
        res.status(404).json({ message: "Không tìm thấy hợp đồng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contract/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const contract = await contractSchema.findById(_id)

      if (contract) {
        contract.deleted = false
        contract.deleteBy = null
        contract.deleteAt = null

        await contract.save()
        res.status(201).json({ message: "Khôi phục thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy hợp đồng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[DELETE] /api/contract/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;

      const result = await contractSchema.deleteOne({ _id });

      if (result.deletedCount === 1) {
        const cacheKey = `contract${_id}`;
        req.cache.del(cacheKey);
        res.status(204).json({ message: "Xoá hợp đồng thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy hợp đồng" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = new ContractController