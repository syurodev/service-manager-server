const orderSchema = require("../models/Order")
const orderItemSchema = require("../models/Order")

class OrderController {
  async create(req, res) {
    try {
      const { } = req.body
    } catch (error) {
      console.log(error)
      res.status(500).json("Internal Server Error")
    }
  }
}
module.exports = new OrderController()