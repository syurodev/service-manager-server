const supportSchema = require("../models/SupportForm")

class SupportController {
  async get(req, res) {
    try {
      const { khachhang = null, nhanvien = null, trangthai = false } = req.query

      const query = { trangthai: false }

      if (khachhang) {
        query.khachhang = khachhang
      }
      if (nhanvien) {
        query.nhanvien = nhanvien
      }

      if (trangthai) {
        query.trangthai = trangthai
      }

      const supports = await supportSchema.find(query, "title noidung createAt")
        .populate("khachhang", "name")
        .populate("nhanvien", "hoten")

      if (supports.length > 0) {
        res.status(201).json(supports)
      } else {
        res.status(201).json({ message: "Không có hỗ trợ" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  async solved(req, res) {
    try {

    } catch (error) {
      console.log(error)
      res.status(500).json()
    }
  }
}

module.exports = new SupportController()