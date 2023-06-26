const contactSchema = require("../models/Contact")

class ContactController {
  //[POST] /api/contact/create
  async create(req, res) {
    try {
      let { name = "", sdt = null, email = null, ngaysinh, gioitinh,
        lienhechinh = false, trangthai, chucvu } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
        }
      }

      if (name?.trim() === "") {
        return res.status(201).json({ message: "Tên người liên hệ là bắt buộc" })
      }

      const existingContact = await contactSchema.find({ name: { $regex: name, $options: "i" } })

      if (existingContact.length > 0) {
        return res.status(201).json({
          message: "Người liên hệ này đã tồn tại",
          existingContact
        })
      }

      const contact = new contactSchema({
        name,
        sdt,
        email,
        ngaysinh,
        gioitinh,
        lienhechinh,
        trangthai,
        chucvu
      })

      await contact.save()

      res.status(201).json({
        message: "Tạo người liên hệ thành công",
        contact
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contact/change-info
  async changeInfo(req, res) {
    try {
      let { _id, name = "", sdt = null, email = "", ngaysinh, gioitinh,
        lienhechinh = false, trangthai, chucvu } = req.body

      if (sdt) {
        if (/^\d+$/.test(sdt)) {
          if (sdt.startsWith('0')) {
            sdt = '84' + sdt.substring(1);
          }
          sdt = parseInt(sdt, 10);
        }
      }

      const contact = await contactSchema.findById(_id)

      if (contact) {
        const existingContacts = await contactSchema.find({
          $or: [
            { name: { $regex: name, $options: "i" } },
            { email: { $regex: email, $options: "i" } },
            { sdt: sdt }
          ]
        })

        if (existingContacts.length > 0) {
          for (let i = 0; i < existingContacts.length; i++) {
            const existingContact = existingContacts[i]

            if (existingContact.name.toLowerCase() === name.toLowerCase() && existingContact.name.toLowerCase() !== contact.name.toLowerCase()) {
              return res.status(201).json({ message: "Tên người liên hệ vừa nhập đã tồn tại" })
            }

            if (existingContact.email.toLowerCase() === email.toLowerCase() && email !== "" && existingContact.email.toLowerCase() !== contact.email.toLowerCase()) {
              return res.status(201).json({ message: "Email vừa nhập đã tồn tại" })
            }

            if (existingContact.sdt === sdt && sdt !== 0 && existingContact.sdt !== contact.sdt) {
              return res.status(201).json({ message: "Số điện thoại vừa nhập đã tồn tại" })
            }
          }
        }

        contact.name = name || contact.name
        contact.sdt = sdt || contact.sdt
        contact.email = email || contact.email
        contact.ngaysinh = ngaysinh || contact.ngaysinh
        contact.gioitinh = gioitinh || contact.gioitinh
        contact.lienhechinh = lienhechinh || contact.lienhechinh
        contact.trangthai = trangthai || contact.trangthai
        contact.chucvu = chucvu || contact.chucvu

        await contact.save()
        const cacheKey = `contact${_id}`;
        req.cache.del(cacheKey);

        res.status(201).json({ message: "Đổi thông tin người liên hệ thành công", contact })
      } else {
        res.status(404).json({ message: "Không tìm thấy người liên hệ" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[GET] /api/contact/get
  async get(req, res) {
    try {
      const { limit = 10, sort = "name", page = 1, q = "", deleted = false, lienhechinh = false, trangthai = null, chucvu = null } = req.query
      const query = { deleted: deleted }

      if (q) {
        query.name = { $regex: q, $options: "i" }
      }
      if (trangthai) {
        query.trangthai = { $regex: trangthai, $options: "i" }
      }
      if (chucvu) {
        query.chucvu = { $regex: chucvu }
      }
      if (lienhechinh) {
        query.lienhechinh = lienhechinh
      }

      const count = await contactSchema.countDocuments(query)
      const totalPages = Math.ceil(count / limit);
      const skip = (page - 1) * limit;

      let currentPage = page ? parseInt(page) : 1;
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      const result = await contactSchema.find(query, "name sdt email lienhechinh trangthai")
        .populate("chucvu", { name: 1 })
        .limit(limit)
        .sort(sort)
        .skip(skip)

      res.status(201).json({
        total: count,
        currentPage: page,
        totalPages,
        data: result
      })
    } catch (error) {
      console.log(error)
      res.status(500).json("Internal Server Error", error)
    }
  }

  //[GET] /api/contact/info
  async info(req, res) {
    try {
      const _id = req.params.id

      const cacheKey = `contact${_id}`;
      const cachedData = req.cache.get(cacheKey);

      if (cachedData) {
        return res.status(201).json(cachedData);
      }

      const contact = await contactSchema.findById(_id)
        .populate("chucvu", "name")

      if (contact) {
        req.cache.set(cacheKey, contact);
        res.status(201).json(contact)
      } else {
        res.status(404).json({ message: "Không tìm thấy người liên hệ" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contact/delete
  async delete(req, res) {
    try {
      const { _id = "", staffid = "" } = req.body

      if (!_id || !staffid) {
        return res.status(401).json({ message: "Thiếu dữ liệu để thực hiện thao tác xoá" })
      }

      const contact = await contactSchema.findById(_id)

      if (contact) {
        contact.deleted = true
        contact.deleteBy = staffid
        contact.deleteAt = Date.now()

        await contact.save()

        res.status(201).json({ message: "Người liên hệ đã được chuyển đến thùng rác" })
      } else {
        res.status(501).json({ message: "Không tìm thấy người liên hệ" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[PATCH] /api/contact/undelete
  async undelete(req, res) {
    try {
      const { _id } = req.body

      const contact = await contactSchema.findById(_id)

      if (contact) {
        contact.deleted = false
        contact.deleteBy = null
        contact.deleteAt = null

        await contact.save()
        res.status(201).json({ message: "Khôi phục thành công" })
      } else {
        res.status(404).json({ message: "Không tìm thấy người liên hệ" })
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  //[DELETE] /api/contact/destroy
  async destroy(req, res) {
    try {
      const { _id } = req.query;
      const result = await contactSchema.deleteOne({ _id });
      if (result.deletedCount === 1) {
        const cacheKey = `contact${_id}`;
        req.cache.del(cacheKey);
        res.status(204).json({ message: "Xoá người liên hệ thành công" });
      } else {
        res.status(404).json({ message: "Không tìm thấy người liên hệ" });
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = new ContactController