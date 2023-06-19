const contractSchema = require("../models/Contract")
const contractTypeSchema = require("../models/ContractType")

class ContractController {
  //[POST] /api/contract/create
  async create(req, res) {
    try {
      const { mahd, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt = 0, ngaytt, soquy, xacnhan = false, ghichu = "", guiemail = false, ghichuthuong = "", loadhd, nhanvien,
        doanhsotinhcho, khachhang, donhang } = req.body

      const existingContract = await contractSchema.find({ mahd: { $regex: mahd } })

      if (existingContract) {
        return res.status(201).json({
          message: "Hợp đồng đã tồn tại",
          contract: existingContract
        })
      }

      const newContractData = new contractSchema({
        mahd, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt, ngaytt, soquy, xacnhan, ghichu, guiemail, ghichuthuong, loadhd, nhanvien,
        doanhsotinhcho, khachhang, donhang
      })

      await newContractData.save()
      res.status(201).json({ message: "Tạo hợp đồng thành công", contract: newContractData })

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/contract/
  async get(req, res) {
    try {
      const { limit = 15, sort = "ngaybatdau", page = 1, nhanvien = null, deleted = false, khachhang = null, loadhd = null } = req.query
      const query = { deleted: deleted }

      if (nhanvien) {
        query.nhanvien = { $regex: nhanvien }
      }

      if (khachhang) {
        query.khachhang = { $regex: khachhang }
      }

      if (loadhd) {
        query.loadhd = { $regex: loadhd }
      }

      const count = await orderSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const contract = await contractSchema.find(query)
        .populate("nhanvien", "hoten")
        .populate("doanhsotinhcho", "hoten")
        .populate("loadhd", "loaihd")
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
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

}

module.exports = new ContractController