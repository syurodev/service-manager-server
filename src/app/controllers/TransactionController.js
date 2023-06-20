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

}

module.exports = new TransactionController()