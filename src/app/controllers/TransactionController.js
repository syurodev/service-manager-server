const transactionSchema = require("../models/Transaction")
const transactionTypeSchema = require("../models/TransactionType")
const transactionStatusSchema = require("../models/TransactionStatus")

class TransactionController {
  //[POST] /api/transaction/type
  async addTransactionType(req, res) {
    try {
      const { name } = req.body

      const existingTransactionType = await transactionTypeSchema.find({ name: { $regex: name, $options: "i" } })

      if (existingTransactionType.length > 0) {
        return res.status(201).json({ message: "Loại giao dịch đã tồn tại" })
      } else {
        const cacheKey = "transactiontypes";
        req.cache.del(cacheKey);

        const newTransactionType = new transactionTypeSchema({
          name
        })

        await newTransactionType.save()
        res.status(201).json({
          message: "Thêm loại giao dịch thành công",
          newTransactionType
        })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/transaction/types
  async getTransactionTypes(req, res) {
    try {
      const cacheKey = `transactiontypes`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const result = await transactionTypeSchema.find()

      if (result) {
        req.cache.set(cacheKey, result);
        res.status(200).json(result)
      } else {
        res.status(404).json({ message: "Không tìm thấy loại giao dịnh" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/transaction/status
  async getTransactionStatus(req, res) {
    try {
      const cacheKey = `transactionstatus`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const result = await transactionStatusSchema.find()

      if (result.length > 0) {
        req.cache.set(cacheKey, result);
        res.status(201).json(result);
      } else {
        res.status(201).json({ message: "Không tìm thấy trạng thái giao dịch" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[POST] /api/transaction/status
  async addTransactionStatus(req, res) {
    try {
      const { name } = req.body
      const cacheKey = `transactionstatus`;

      const existingTransactionStatus = await transactionStatusSchema.find({ name: { $regex: name, $options: "i" } })

      if (existingTransactionStatus.length > 0) {
        return res.status(201).json({ message: "Trạng thái giao dịch đã tồn tại" })
      }

      req.cache.del(cacheKey);

      const newTransactionStatus = new transactionStatusSchema({
        name
      })

      await newTransactionStatus.save()
      const result = await transactionStatusSchema.find()
      req.cache.set(cacheKey, result);

      res.status(201).json({ message: "Thêm trạng thái giao dịch thành công", result })

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[POST] /api/transaction/create
  async create(req, res) {
    try {
      const {
        name,
        diachigd = null,
        mota = null,
        danhgia = null,
        ngaybatdau = null,
        hanhoanthanh = null,
        songaygd = null,
        ketquagd = null,
        guiemail = false,
        tailieugiaodich = null,
        loaigd = null,
        trangthaigd = null,
        khachhang = null,
        nguoilienhe = null,
        nhanvien = null,
      } = req.body

      const existingTransaction = await transactionSchema.find({ name: { $regex: name, $options: "i" } })

      if (existingTransaction.length > 0) {
        return res.status(201).json({ status: false, message: "Giao dịch đã tồn tại" })
      }

      const newTransaction = new transactionSchema({
        name,
        diachigd,
        mota,
        danhgia,
        ngaybatdau,
        hanhoanthanh,
        songaygd,
        ketquagd,
        guiemail,
        tailieugiaodich,
        loaigd,
        trangthaigd,
        khachhang,
        nguoilienhe,
        nhanvien,
      })

      await newTransaction.save()
      res.status(201).json({ status: true, message: "Tạo giao dịch thành công" })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/transaction/edit
  async edit(req, res) {
    try {
      const {
        _id,
        name,
        diachigd = null,
        mota = null,
        danhgia = null,
        ngaybatdau = null,
        hanhoanthanh = null,
        songaygd = null,
        ketquagd = null,
        guiemail = false,
        tailieugiaodich = null,
        loaigd = null,
        trangthaigd = null,
        khachhang = null,
        nguoilienhe = null,
        nhanvien = null,
      } = req.body

      const transaction = await transactionSchema.findById(_id)

      if (transaction) {
        const existingTransactions = await transactionSchema.find({ name: { $regex: name, $options: "i" } })

        if (existingTransactions.length > 0) {
          for (let i = 0; i < existingTransactions.length; i++) {
            const existingTransaction = existingTransactions[i]

            if (existingTransaction.name.toLowerCase() === name.toLowerCase() && existingTransaction.name.toLowerCase() !== transaction.name.toLowerCase()) {
              return res.status(201).json({ message: "Tên giao dịch đã tồn tại" })
            }
          }
        }

        const cacheKey = `transaction${_id}`;
        req.cache.del(cacheKey);

        transaction.name = name || transaction.name
        transaction.diachigd = diachigd || transaction.diachigd
        transaction.mota = mota || transaction.mota
        transaction.danhgia = danhgia || transaction.danhgia
        transaction.ngaybatdau = ngaybatdau || transaction.ngaybatdau
        transaction.hanhoanthanh = hanhoanthanh || transaction.hanhoanthanh
        transaction.songaygd = songaygd || transaction.songaygd
        transaction.ketquagd = ketquagd || transaction.ketquagd
        transaction.guiemail = guiemail || transaction.guiemail
        transaction.tailieugiaodich = tailieugiaodich || transaction.tailieugiaodich
        transaction.loaigd = loaigd || transaction.loaigd
        transaction.trangthaigd = trangthaigd || transaction.trangthaigd
        transaction.ketquagd = ketquagd || transaction.ketquagd
        transaction.khachhang = khachhang || transaction.khachhang
        transaction.nguoilienhe = nguoilienhe || transaction.nguoilienhe
        transaction.nhanvien = nhanvien || transaction.nhanvien

        await transaction.save()
        res.status(201).json({ message: "Thay đổi thông tin thành công", transaction })
      } else {
        res.status(204).json({ message: "Không tìm thấy thông tin giao dịch" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[PATCH] /api/transaction/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(201).json({ status: false, message: "Thiếu dữ liệu để thực hiện thao tác xoá" })
      }

      const transaction = await transactionSchema.findById(_id)

      if (transaction) {
        transaction.deleted = true
        transaction.deleteBy = staffid
        transaction.deleteAt = Date.now()

        await transaction.save()
        res.status(201).json({ status: true, message: "Giao dịch đã được chuyển đến thùng rác" })
      } else {
        res.status(201).json({ status: false, message: "Không tìm thấy giao dịch" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[PATCH] /api/transaction/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const transaction = await transactionSchema.findById(_id)

      if (transaction) {
        transaction.deleted = false
        transaction.deleteBy = null
        transaction.deleteAt = null

        await contract.save()
        res.status(201).json({ status: true, message: "Khôi phục thành công" })
      } else {
        res.status(201).json({ status: false, message: "Không tìm thấy giao dịch" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[DELETE] /api/transaction/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;

      const result = await transactionSchema.deleteOne({ _id });

      if (result.deletedCount === 1) {
        const cacheKey = `transaction${_id}`;
        req.cache.del(cacheKey);
        res.status(201).json({ status: true, message: "Xoá hợp đồng thành công" });
      } else {
        res.status(201).json({ status: false, message: "Không tìm thấy hợp đồng" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[GET] /api/transaction/:id
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `transaction${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const transaction = await transactionSchema.findById(_id)
        .populate("loaigd", "name")
        .populate("trangthaigd", "name")
        .populate("khachhang", "name sdt email")
        .populate("nhanvien", "hoten")
        .populate("nguoilienhe", "name sdt email")

      if (transaction) {
        req.cache.set(cacheKey, transaction);
        res.status(201).json({ transaction: transaction })
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/transaction/
  async get(req, res) {
    try {
      const { q = "", limit = 10, page = 1, sort = "createAt", loaigd = null, trangthaigd = null, khachhang = null, nguoilienhe = null, nhanvien = null, deleted = false } = req.query

      const query = { deleted: deleted }

      if (q !== "") {
        query.name = { $regex: q, $options: "i" }
      }

      if (loaigd) {
        query.loaigd = loaigd
      }

      if (trangthaigd) {
        query.trangthaigd = trangthaigd
      }

      if (khachhang) {
        query.khachhang = khachhang
      }

      if (nguoilienhe) {
        query.nguoilienhe = nguoilienhe
      }

      if (nhanvien) {
        query.nhanvien = nhanvien
      }

      const count = await transactionSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const result = await transactionSchema.find(query, "name danhgia")
        .populate("loaigd", "name")
        .populate("trangthaigd", "name")
        .populate("khachhang", "name")
        .populate("nhanvien", "hoten")
        .populate("nguoilienhe", "name")
        .limit(limit)
        .sort(sort)
        .skip(skip)

      if (result.length > 0) {
        res.status(201).json({
          total: count,
          currentPage: page,
          totalPages,
          transactions: result
        })
      } else {
        res.status(201).json({ message: "Không có giao dịch" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }
}

module.exports = new TransactionController()