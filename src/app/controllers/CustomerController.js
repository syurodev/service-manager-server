const provincesSchema = require("../models/Provinces")
const districtsSchema = require("../models/Districts")
const wardsSchema = require("../models/Wards")
const customerSchema = require("../models/Customer")
const customerTypeSchema = require("../models/CustomerType")

class CustomerController {
  //[GET] /api/customer/
  async get(req, res) {
    try {
      const { limit = 15, sort = "createAt", page = 1, q = "", loaikhachhang = null, tinh = null, phuong = null, xa = null, nhanvien = null, deleted = false, mini = false } = req.query
      const query = { deleted: deleted }

      if (q) {
        query.name = { $regex: q, $options: "i" }
      }

      if (loaikhachhang) {
        query.loaikhachhang = loaikhachhang
      }
      if (tinh) {
        query.tinh = tinh
      }
      if (phuong) {
        query.phuong = phuong
      }
      if (xa) {
        query.xa = xa
      }
      if (nhanvien) {
        query.nhanvien = nhanvien
      }

      if (mini) {
        const result = await customerSchema.find(query, "name")
        res.status(201).json({
          data: result
        })
      } else {
        const count = await customerSchema.countDocuments(query)
        const totalPages = Math.ceil(count / limit);
        const skip = (page - 1) * limit;

        let currentPage = page ? parseInt(page) : 1;
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }

        const result = await customerSchema.find(query, "name diachivp sdt email masothue ngaytaokh nguoidaidien sdtndd")
          .populate("tinh", { name: 1 })
          .populate("phuong", { name: 1 })
          .populate("xa", { name: 1 })
          .populate("loaikhachhang", { name: 1 })
          .populate("chucvundd", { name: 1 })
          .populate("nhanvien", { hoten: 1 })
          .populate("nguoilienhe", { name: 1 })
          .limit(limit)
          .sort(sort)
          .skip(skip)

        res.status(201).json({
          total: count,
          currentPage: page,
          totalPages,
          data: result
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[POST] /api/customer/create
  async create(req, res) {
    try {
      let { name, diachivp, sdt = null, email = null, masothue, mota, website, thongtinkhac = null, stk = null, nguoidaidien = null, chucvundd = null, sdtndd = null, loaikhachhang, tinh, phuong, xa, nhanvien, nguoilienhe, } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
        }
      }

      if (sdtndd) {
        if (/^\d+$/.test(sdtndd)) {
          if (sdtndd.startsWith('0')) {
            sdtndd = '84' + sdtndd.substring(1);
          }
          sdtndd = parseInt(sdtndd, 10);
        }
      }

      const existingProvince = await provincesSchema.findOne({ code: tinh.code })
      let tinhId;
      if (!existingProvince) {
        const province = new provincesSchema({
          name: tinh.name,
          code: tinh.code
        })
        const savedProvince = await province.save();
        tinhId = savedProvince._id;
      } else {
        tinhId = existingProvince._id;
      }

      const existingDistrict = await districtsSchema.findOne({ code: phuong.code })
      let phuongId;
      if (!existingDistrict) {
        const district = new districtsSchema({
          name: phuong.name,
          code: phuong.code,
          province_code: phuong.province_code,
          province: tinhId
        })
        const savedDistrict = await district.save();
        phuongId = savedDistrict._id;
      } else {
        phuongId = existingDistrict._id;
      }

      const existingWard = await wardsSchema.findOne({ code: xa.code })
      let xaId;
      if (!existingWard) {
        const ward = new wardsSchema({
          name: xa.name,
          code: xa.code,
          district_code: xa.district_code,
          district: phuongId
        })
        const savedWard = await ward.save();
        xaId = savedWard._id;
      } else {
        xaId = existingWard._id;
      }

      const existingCustomer = await customerSchema.findOne({ masothue: masothue })
      if (!existingCustomer) {
        const customer = new customerSchema({
          name,
          diachivp,
          sdt,
          email,
          masothue,
          mota,
          website,
          thongtinkhac,
          stk,
          nguoidaidien,
          sdtndd,
          loaikhachhang,
          tinh: tinhId,
          phuong: phuongId,
          xa: xaId,
          chucvundd,
          nhanvien,
          nguoilienhe,
        })

        await customer.save()
        res.status(201).json(customer);

      } else {
        res.status(201).json({
          message: "Người dùng đã được tạo trước đó",
          existingCustomer
        });
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[POST] /api/customer/type
  async addCustomerType(req, res) {
    try {
      const { name, mota } = req.body
      const cacheKey = `customertypes`;
      req.cache.del(cacheKey);

      const result = await customerTypeSchema.findOne({ name: { $regex: name, $options: "i" } })

      if (result) {
        res.status(201).json({
          status: false,
          message: "Loại khách hàng đã tồn tại"
        })
      } else {
        const data = new customerTypeSchema({
          name: name,
          mota: mota
        })

        await data.save()
        const customerTypes = await customerTypeSchema.find({}, "name")
        req.cache.set(cacheKey, customerTypes);

        res.status(201).json({
          status: true,
          message: "Thêm loại khách hàng thành công",
          customerTypes
        })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/customer/type 
  async editCustomerType(req, res) {
    try {
      const { _id, name } = req.body

      const result = await customerTypeSchema.findById(_id)

      if (result) {
        const existingCustomerType = await customerTypeSchema.find({ name: { $regex: name, $options: "i" } })

        if (existingCustomerType.length > 0) {
          for (let i = 0; i < existingCustomerType.length; i++) {
            const type = existingCustomerType[i]
            if (type.name.toLocaleLowerCase() !== result.name && type.name.toLocaleLowerCase() === name)
              return res.status(201).json({ message: "Tên loại khách hàng đã tồn tại" })
          }
        }

        const cacheKey = `customertypes`;
        req.cache.del(cacheKey);

        result.name = name

        await result.save()

        res.status(201).json({ message: "Thay đổi loại khách hàng thành công" })
      } else {
        res.status(204).json({ message: "Không tìm thấy loại khách hàng" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error", error })
    }
  }

  //[GET] /api/customer/type
  async getCustomerTypes(req, res) {
    try {
      const cacheKey = `customertypes`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const result = await customerTypeSchema.find()

      if (result) {
        req.cache.set(cacheKey, result);
        res.status(200).json(result)
      } else {
        res.status(404).json({ message: "Không tìm thấy loại khách hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/customer/change-info
  async changeInfo(req, res) {
    try {
      let { _id, name = "", diachivp = null, sdt = null, email = null, masothue, mota = null, website = null, thongtinkhac = null, stk = null, nguoidaidien = null, chucvundd = null, sdtndd = null, loaikhachhang, tinh, phuong, xa, nguoilienhe, } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
        }
      }

      if (sdtndd) {
        if (/^\d+$/.test(sdtndd)) {
          if (sdtndd.startsWith('0')) {
            sdtndd = '84' + sdtndd.substring(1);
          }
          sdtndd = parseInt(sdtndd, 10);
        }
      }

      const customer = await customerSchema.findById(_id)

      if (customer) {
        const existingCustomers = await customerSchema.find({
          $or: [
            { name: { $regex: name, $options: "i" } },
            { email: { $regex: email, $options: "i" } },
            { sdt: sdt }
          ]
        })

        if (existingCustomers.length > 0) {
          for (let i = 0; i < existingCustomers.length; i++) {
            const existingCustomer = existingCustomers[i]

            if (existingCustomer.name.toLowerCase() === name.toLowerCase() && existingCustomer.name.toLowerCase() !== customer.name.toLowerCase()) {
              return res.status(201).json({ message: "Tên người liên hệ vừa nhập đã tồn tại" })
            }

            if (existingCustomer.email.toLowerCase() === email.toLowerCase() && email !== "" && existingCustomer.email.toLowerCase() !== customer.email.toLowerCase()) {
              return res.status(201).json({ message: "Email vừa nhập đã tồn tại" })
            }

            if (existingCustomer.sdt === sdt && sdt !== 0 && existingCustomer.sdt !== customer.sdt) {
              return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
            }
          }
        }

        customer.name = name || customer.name;
        customer.diachivp = diachivp || customer.diachivp;
        customer.sdt = sdt || customer.sdt;
        customer.email = email || customer.email;
        customer.masothue = masothue || customer.masothue;
        customer.mota = mota || customer.mota;
        customer.website = website || customer.website;
        customer.thongtinkhac = thongtinkhac || customer.thongtinkhac;
        customer.stk = stk || customer.stk;
        customer.nguoidaidien = nguoidaidien || customer.nguoidaidien;
        customer.sdtndd = sdtndd || customer.sdtndd;
        customer.loaikhachhang = loaikhachhang || customer.loaikhachhang;
        customer.tinh = tinh || customer.tinh;
        customer.phuong = phuong || customer.phuong;
        customer.xa = xa || customer.xa;
        customer.chucvundd = chucvundd || customer.chucvundd;
        customer.nguoilienhe = nguoilienhe || customer.nguoilienhe;

        await customer.save()
        const cacheKey = `customer${_id}`;
        req.cache.del(cacheKey);

        res.status(201).json({ message: "Chỉnh sửa thông tin khách hàng thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy khách hàng" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/customer/:id
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `customer${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const customer = await customerSchema.findById(_id)
        .populate("loaikhachhang", "name")
        .populate("tinh", "name")
        .populate("phuong", "name")
        .populate("xa", "name")
        .populate("chucvundd", "name")
        .populate("nhanvien", "hoten")
        .populate("nguoilienhe", "name")

      if (customer) {
        req.cache.set(cacheKey, customer);
        res.status(201).json(customer)
      } else {
        res.status(404).json({ message: "Không tìm thấy khách hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/customer/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(401).json("Thiếu dữ liệu để thực hiện thao tác xoá")
      }

      const customer = await customerSchema.findById(_id)

      if (customer) {
        customer.deleted = true
        customer.deleteBy = staffid
        customer.deleteAt = Date.now()

        await customer.save()
        res.status(201).json({ message: "Khách hàng đã được chuyển đến thùng rác" })
      } else {
        res.status(404).json({ message: "Không tìm thấy khách hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/customer/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const customer = await customerSchema.findById(_id)

      if (customer) {
        customer.deleted = false
        customer.deleteBy = null
        customer.deleteAt = null

        await contact.save()
        res.status(201).json({ message: "Khôi phục thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy khách hàng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[DELETE] /api/customer/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;
      const result = await customerSchema.deleteOne({ _id });
      if (result.deletedCount === 1) {
        const cacheKey = `customer${_id}`;
        req.cache.del(cacheKey);
        res.status(204).json({ message: "Xoá khách hàng thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy khách hàng" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = new CustomerController()