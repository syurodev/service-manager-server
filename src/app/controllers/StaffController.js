const staffAccountSchema = require("../models/StaffAccount")
const staffSchema = require("../models/Staff")
const provincesSchema = require("../models/Provinces")
const districtsSchema = require("../models/Districts")
const wardsSchema = require("../models/Wards")
const positionSchema = require("../models/Position")

class StaffController {
  // [GET] /api/staff/login
  async login(req, res) {
    try {
      const { username, password } = req.query;

      if (username.trim() !== "" && password.trim() !== "") {
        const result = await staffAccountSchema.findOne({ username: username, password: password });

        if (result) {
          const staff = await staffSchema.findById(result.nhanvien, "hoten");
          if (staff) {
            res.status(200).json(staff);
          } else {
            res.status(404).json({ message: "Không tìm thấy thông tin nhân viên" });
          }
        } else {
          res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }
      } else {
        res.status(401).json({ message: "Tài khoản hoặc mật khẩu đã bị bỏ trống" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  // [POST] /api/staff/signin
  async signin(req, res) {
    try {
      const { username, password, nhanvien, role } = req.body
      if (username && password && nhanvien && role) {
        const existingAccount = await staffAccountSchema.findOne({ $or: [{ username: username }, { nhanvien: nhanvien }] });

        if (!existingAccount) {
          const data = new staffAccountSchema({
            username: username,
            password: password,
            role: role,
            nhanvien: nhanvien
          })
          await data.save()
          res.status(201).json({ message: "Tạo tài khoản thành công" });
        } else {
          res.status(201).json({ message: "Tên tài khoản đã tồn tại hoặc nhân viên đã có tài khoản" });
        }
      } else {
        res.status(401).json({ message: "Vui lòng nhập đầy đủ các trường" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[POST] /api/staff/create
  async create(req, res) {
    try {
      let { hoten = "", email = "", sdt = null, ngaysinh, ngayvaolam, cccd = null,
        phongban, chucvu, tinh, phuong, xa } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
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

      const staff = new staffSchema({
        hoten: hoten,
        email: email,
        sdt: sdt,
        ngaysinh: ngaysinh,
        ngayvaolam: ngayvaolam,
        cccd: cccd,
        phongban: phongban,
        chucvu: chucvu,
        tinh: tinhId,
        phuong: phuongId,
        xa: xaId
      })

      const existingStaffs = await staffSchema.find({
        $or: [
          { hoten: { $regex: hoten, $options: "i" } },
          { email: { $regex: email, $options: "i" } },
          { cccd: cccd },
          { sdt: sdt }
        ]
      })

      if (existingStaffs.length > 0) {
        for (let i = 0; i < existingStaffs.length; i++) {
          const existingStaff = existingStaffs[i]

          if (existingStaff.hoten.toLowerCase() === staff.hoten.toLowerCase()) {
            return res.status(201).json({ message: "Tên nhân viên vừa nhập đã tồn tại" })
          }

          if (existingStaff.email.toLowerCase() === staff.email.toLowerCase() && email !== "") {
            return res.status(201).json({ message: "Email vừa nhập đã tồn tại" })
          }

          if (existingStaff.cccd === staff.cccd) {
            return res.status(201).json({ message: "CCCD vừa nhập đã tồn tại" })
          }

          if (existingStaff.sdt === staff.sdt) {
            return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
          }

          if (existingStaff.cccd === cccd && cccd !== 0 && existingStaff.cccd !== staff.cccd) {
            return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
          }
        }
      }

      await staff.save()
      res.status(201).json({
        message: "Thêm nhân viên thành công",
        data: staff
      }
      );

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Serrver Error" })
    }
  }

  //[PATCH] /api/staff/change-password
  async changePassword(req, res) {
    try {
      const { id, oldpass, newpass } = req.body

      const account = await staffAccountSchema.findById(id)
      if (account) {
        if (oldpass.trim() === account.password) {
          account.password = newpass
          await account.save()
          res.status(200).json({ message: "Thay đổi mật khẩu thành công" })
        } else {
          res.status(401).json({ message: "Mật khẩu cũ được nhập không chính xác" })
        }
      } else {
        res.status(404).json({ message: "không tìm thấy tài khoản" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/staff/change-info
  async changeInfo(req, res) {
    try {
      let { _id, hoten = "", email = "", sdt = null, ngaysinh, cccd = null,
        phongban, chucvu, tinh, phuong, xa } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
        }
      }

      const staff = await staffSchema.findById(_id)

      if (staff) {
        const existingStaffs = await staffSchema.find({
          $or: [
            { hoten: { $regex: hoten, $options: "i" } },
            { email: { $regex: email, $options: "i" } },
            { cccd: cccd },
            { sdt: sdt }
          ]
        })

        if (existingStaffs.length > 0) {
          for (let i = 0; i < existingStaffs.length; i++) {
            const existingStaff = existingStaffs[i]

            if (existingStaff.hoten.toLowerCase() === hoten.toLowerCase() && existingStaff.hoten.toLowerCase() !== staff.hoten.toLowerCase()) {
              return res.status(201).json({ message: "Tên nhân viên vừa nhập đã tồn tại" })
            }

            if (existingStaff.email.toLowerCase() === email.toLowerCase() && email !== "" && existingStaff.email.toLowerCase() !== staff.email.toLowerCase()) {
              return res.status(201).json({ message: "Email vừa nhập đã tồn tại" })
            }

            if (existingStaff.email.toLowerCase() === email.toLowerCase() && email !== "" && existingStaff.email.toLowerCase() !== staff.email.toLowerCase()) {
              return res.status(201).json({ message: "Email vừa nhập đã tồn tại" })
            }

            if (existingStaff.sdt === sdt && sdt !== 0 && existingStaff.sdt !== staff.sdt) {
              return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
            }

            if (existingStaff.cccd === cccd && cccd !== 0 && existingStaff.cccd !== staff.cccd) {
              return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
            }
          }
        }

        staff.hoten = hoten || staff.hoten
        staff.email = email || staff.email
        staff.sdt = sdt || staff.sdt
        staff.ngaysinh = ngaysinh || staff.ngaysinh
        staff.cccd = cccd || staff.cccd
        staff.phongban = phongban || staff.phongban
        staff.chucvu = chucvu || staff.chucvu
        staff.tinh = tinh || staff.tinh
        staff.phuong = phuong || staff.phuong
        staff.xa = xa || staff.xa

        await staff.save()
        const cacheKey = `staff${_id}`;
        req.cache.del(cacheKey);

        res.status(200).json({
          message: "Thay đổi thông tin nhân viên thành công",
          data: staff
        })
      } else {
        res.status(404).json({ message: "Không tìm thấy nhân viên" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/staff/
  async get(req, res) {
    try {
      const { limit = 10, sort = "ngayvaolam", page = 1, q = "", chucvu = null, tinh = null, phuong = null, xa = null, mini = false } = req.query
      const query = {}

      if (q) {
        query.hoten = { $regex: q, $options: "i" }
      }

      if (chucvu) {
        query.chucvu = { $regex: chucvu }
      }

      if (tinh) {
        query.tinh = { $regex: tinh }
      }

      if (phuong) {
        query.phuong = { $regex: phuong }
      }

      if (xa) {
        query.xa = { $regex: xa }
      }

      const count = await staffSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      if (mini) {
        const result = await staffSchema.find({ hoten: { $regex: hoten, $options: "i" } }, "hoten")

        res.status(201).json({
          staffs: result
        })
      } else {
        const result = await staffSchema.find(query)
          .populate("tinh", { name: 1 })
          .populate("phuong", { name: 1 })
          .populate("xa", { name: 1 })
          .populate("chucvu", { name: 1 })
          .limit(limit)
          .sort(sort)
          .skip(skip)

        res.status(201).json({
          total: count,
          currentPage: page,
          totalPages,
          staffs: result
        })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[POST] /api/staff/add-position
  async addPosition(req, res) {
    try {
      const { name = "" } = req.body

      console.log(name)

      if (name) {
        const result = await positionSchema.findOne({ name: { $regex: name, $options: "i" } })

        if (result) {
          res.status(201).json({ message: "Chức vụ đã tồn tại" })
        } else {
          const data = new positionSchema({
            name: name
          })

          await data.save()
          const cacheKey = `positions`;
          req.cache.del(cacheKey);

          const positions = await positionSchema.find()

          res.status(201).json({
            message: "Thêm chức vụ thành công",
            positions
          })
        }
      } else {
        res.status(401).json({ message: "Không được bỏ trống tên" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/staff/position
  async positions(req, res) {
    try {
      const cacheKey = `positions`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const positions = await positionSchema.find({}, "name")

      req.cache.set(cacheKey, positions);
      res.status(201).json(positions)
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/staff/profile/:id
  async profile(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `staff${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const profile = await staffSchema.findOne({ _id })
        .populate("chucvu", "name")
        .populate("tinh", "name")
        .populate("phuong", "name")
        .populate("xa", "name")

      if (profile) {
        req.cache.set(cacheKey, profile);
        res.status(201).json(profile)
      } else {
        res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new StaffController();
