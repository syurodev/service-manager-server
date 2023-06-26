const contractSchema = require("../models/Contract")
const contractTypeSchema = require("../models/ContractType")
const orderSchema = require("../models/Order")

class ContractController {
  //[POST] /api/contract/create
  async create(req, res) {
    try {
      const { mahd, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt = 0, ngaytt, soquy, xacnhan = false, ghichu = "", guiemail = false, ghichuthuong = "", loadhd, nhanvien,
        doanhsotinhcho, khachhang, donhang } = req.body

      const existingContract = await contractSchema.find({ mahd: { $regex: mahd } })

      if (existingContract.length > 0) {
        return res.status(201).json({
          message: "Mã hợp đồng đã tồn tại",
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
      const { limit = 15, sort = "createAt", page = 1, nhanvien = null, deleted = false, khachhang = null, loaihd = null } = req.query
      const query = { deleted: deleted }

      if (nhanvien) {
        query.nhanvien = { $regex: nhanvien }
      }

      if (khachhang) {
        query.khachhang = { $regex: khachhang }
      }

      if (loaihd) {
        query.loaihd = { $regex: loaihd }
      }

      const count = await contractSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const contract = await contractSchema.find(query, "mahd giatrihd")
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
        .populate("loadhd", "loaihd")
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
          nhanvien: contract.nhanvien.hoten,
          khachhang: contract.khachhang.name,
          loaihd: contract.loadhd.loaihd,
          ngaybatdau: contract.ngaybatdau,
          ngayketthuc: contract.ngayketthuc,
          hinhthuctt: contract.hinhthuctt,
          loaitt: contract.loaitt,
          sotientt: contract.sotientt,
          ngaytt: contract.ngaytt,
          soquy: contract.soquy,
          ghichu: contract.ghichu,
          items: contract.donhang.items.map((item) => {
            const giabanra = item.hanghoa.giabanra;
            const thue = item.hanghoa.thue;
            const soluong = item.soluong;
            const chietkhau = item.chietkhau;

            // Tính giá trị hàng hoá
            const giaTriHangHoa = (giabanra + giabanra * (thue / 100)) * soluong * (1 - chietkhau / 100);

            return {
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
      res.status(500).json({ error: "Internal Server Error" })
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
      const { _id, mahd, giatrihd, ngaybatdau, ngayketthuc, canhbaohh, hinhthuctt, loaitt,
        sotientt = 0, ngaytt, soquy, xacnhan = false, ghichu = "", guiemail = false, ghichuthuong = "", loadhd, nhanvien,
        doanhsotinhcho, khachhang, donhang } = req.body

      const contract = await contractSchema.findById(_id)

      if (contract) {
        const existingContract = await contractSchema.find({ mahd: { $regex: mahd } })

        if (existingContract.length > 0) {
          return res.status(201).json({ message: "Mã hợp đồng đã tồn tại" })
        }

        contract.mahd = mahd || contract.mahd
        contract.giatrihd = giatrihd || contract.giatrihd
        contract.ngaybatdau = ngaybatdau || contract.ngaybatdau
        contract.ngayketthuc = ngayketthuc || contract.ngayketthuc
        contract.canhbaohh = canhbaohh || contract.canhbaohh
        contract.hinhthuctt = hinhthuctt || contract.hinhthuctt
        contract.loaitt = loaitt || contract.loaitt
        contract.sotientt = sotientt || contract.sotientt
        contract.ngaytt = ngaytt || contract.ngaytt
        contract.soquy = soquy || contract.soquy
        contract.xacnhan = xacnhan || contract.xacnhan
        contract.ghichu = ghichu || contract.ghichu
        contract.guiemail = guiemail || contract.guiemail
        contract.ghichuthuong = ghichuthuong || contract.ghichuthuong
        contract.loadhd = loadhd || contract.loadhd
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