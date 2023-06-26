const commoditySchema = require("../models/Commodity")
const commodityTypeSchema = require("../models/CommodityType")
const commodityUnitSchema = require("../models/CommodityUnit")

class CommodityController {
  //[POST] /api/commodity/create
  async create(req, res) {
    try {
      const { mahh, name, image, gianhap, giabanra, mota, thue, trangthai, soluongtrongkho, dvt, loaihh } = req.body

      const result = await commoditySchema.findOne({ mahh: mahh })

      if (result) {
        res.status(201).json({
          message: "Mã hàng hoá này đã tồn tại"
        })
      } else {
        const data = new commoditySchema({
          mahh, name, image, gianhap, giabanra, mota, thue, trangthai, soluongtrongkho, dvt, loaihh
        })

        await data.save()
        res.status(201).json({
          message: "Thêm hàng hoá thành công",
          data
        })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/commodity/type
  async getCommodityTypes(req, res) {
    try {
      const cacheKey = "commoditytypes";
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const commodityTypes = await commodityTypeSchema.find({}, "loaihh")

      if (commodityTypes.length > 0) {
        req.cache.set(cacheKey, commodityTypes);
        res.status(201).json(commodityTypes)
      } else {
        res.status(404).json({ message: "Không tìm thấy loại hàng hoá" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }

  }

  //[POST] /api/commodity/create-type
  async createCommodityType(req, res) {
    try {
      const { loaihh, mota = "" } = req.body

      const result = await commodityTypeSchema.findOne({ loaihh: { $regex: loaihh, $options: "i" } })

      if (result) {
        res.status(501).json({
          message: "Loại hàng hoá đã tồn tại"
        })
      } else {
        const cacheKey = "commodityunits";
        req.cache.del(cacheKey);

        const data = new commodityTypeSchema({
          loaihh: loaihh,
          mota: mota
        })

        await data.save()
        const commodityTypes = await commodityTypeSchema.find({}, "loaihh")
        res.status(201).json({
          message: "Thêm loại hành hoá thành công",
          commodityTypes
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }

  }

  //[GET] /api/commodity/unit
  async getCommodityUnits(req, res) {
    try {
      const cacheKey = "commodityunits";
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const commodityUnits = await commodityUnitSchema.find({}, "dvt")

      if (commodityUnits.length > 0) {
        req.cache.set(cacheKey, commodityUnits);
        res.status(201).json(commodityUnits)
      } else {
        res.status(404).json({ message: "Không tìm thấy đơn vị tính" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }

  }

  //[POST] /api/commodity/create-unit
  async createCommodityUnit(req, res) {
    try {
      const { dvt } = req.body

      const result = await commodityUnitSchema.findOne({ dvt: { $regex: dvt, $options: "i" } })

      if (result) {
        res.status(201).json({ message: "Đơn vị tính đã tồn tại" })
      } else {
        const cacheKey = "commoditytypes";
        req.cache.del(cacheKey);

        const data = new commodityUnitSchema({
          dvt: dvt,
        })

        await data.save()
        const commodityUnits = await commodityUnitSchema.find({}, "dvt")

        res.status(201).json({
          message: "Thêm đơn vị tính thành công",
          commodityUnits
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/commodity
  async commodities(req, res) {
    try {
      const { limit = 10, sort = "createAt", page = 1, q = "", loaihh = null, trangthai = null, dvt = null } = req.query
      let query = {}

      if (q) {
        query = {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { mahh: { $regex: q, $options: "i" } }
          ],
        }
      }

      if (loaihh) {
        query.loaihh = loaihh;
      }
      if (trangthai) {
        query.trangthai = trangthai;
      }
      if (dvt) {
        query.dvt = dvt;
      }

      const count = await commoditySchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const result = await commoditySchema.find(query)
        .populate("dvt", "dvt")
        .populate("loaihh", "loaihh")
        .limit(limit)
        .sort(sort)
        .skip(skip)

      const data = {
        total: count,
        currentPage: page,
        totalPages,
        data: result
      }

      res.status(201).json(data)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  //[PATCH] /api/commodity/change-info
  async changeInfo(req, res) {
    try {
      const { _id, mahh = "", name = "", image, gianhap, giabanra, mota, thue, trangthai, soluongtrongkho, dvt, loaihh } = req.body

      const commoditiy = await commoditySchema.findById(_id)

      if (commoditiy) {

        if (mahh || name) {
          const existingCommodities = await commoditySchema.find({
            $or: [
              { name: { $regex: name, $options: "i" } },
              { mahh: { $regex: mahh, $options: "i" } }
            ]
          })

          if (existingCommodities.length > 0) {
            for (let i = 0; i < existingCommodities.length; i++) {
              const existingCommoditiy = existingCommodities[i]

              if (existingCommoditiy.name.toLowerCase() === name.toLowerCase() && existingCommoditiy.name.toLowerCase() !== commoditiy.name.toLowerCase()) {
                return res.status(201).json({ message: "Tên hàng hoá vừa nhập đã tồn tại" })
              }

              if (existingCommoditiy.mahh.toLowerCase() === mahh.toLowerCase() && existingCommoditiy.mahh.toLowerCase() !== commoditiy.mahh.toLowerCase()) {
                return res.status(201).json({ message: "Mã hàng hoá vừa nhập đã tồn tại" })
              }
            }
          }
        }

        commoditiy.mahh = mahh || commoditiy.mahh
        commoditiy.name = name || commoditiy.name
        commoditiy.image = image || commoditiy.image
        commoditiy.gianhap = gianhap || commoditiy.gianhap
        commoditiy.giabanra = giabanra || commoditiy.giabanra
        commoditiy.mota = mota || commoditiy.mota
        commoditiy.thue = thue || commoditiy.thue
        commoditiy.trangthai = trangthai || commoditiy.trangthai
        commoditiy.soluongtrongkho = soluongtrongkho || commoditiy.soluongtrongkho
        commoditiy.dvt = dvt || commoditiy.dvt
        commoditiy.loaihh = loaihh || commoditiy.loaihh

        await commoditiy.save()
        const cacheKey = `commoditiy${_id}`;
        req.cache.del(cacheKey);

        res.status(201).json({ message: "Thay đổi thông tin hàng hoá thành công", commoditiy })

      } else {
        res.status(404).json({ message: "Không tìm thấy hàng hoá" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }

  //[GET] /api/commodity/info
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `commodity${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const commodity = await commoditySchema.findById(_id)
        .populate("dvt", "dvt")
        .populate("loaihh", "loaihh")

      if (commodity) {
        req.cache.set(cacheKey, commodity);
        res.status(201).json(commodity)
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/commodity/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(401).json({ message: "Thiếu dữ liệu để thực hiện thao tác xoá" })
      }

      const commodity = await commoditySchema.findById(_id)

      if (commodity) {
        commodity.deleted = true
        commodity.deleteBy = staffid
        commodity.deleteAt = Date.now()

        await commodity.save()

        res.status(201).json({ message: "Xoá hàng hoá thành công" })
      } else {
        res.status(501).json({ message: "Không tìm thấy hàng hoá" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/commodity/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const commodity = await commoditySchema.findById(_id)

      if (commodity) {
        commodity.deleted = false
        commodity.deleteBy = null
        commodity.deleteAt = null

        await commodity.save()
        res.status(201).json({ message: "Khôi phục thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy hàng hoá" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[DELETE] /api/commodity/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;
      const result = await commoditySchema.deleteOne(_id);
      console.log(result.deletedCount)
      if (result.deletedCount === 1) {
        res.status(204).json({ message: "Xoá hàng hoá thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy hàng hoá" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}
module.exports = new CommodityController()