const provinceSchema = require("../models/Provinces")

class LocationController {
  async getListProvince(req, res) {
    const { q } = req.query
    const query = {}

    if (q) {
      query.name = { $regex: q, $options: "i" }
    }

    try {
      const provinces = await provinceSchema.find(query)
      if (provinces.length > 0) {
        res.status(201).json(provinces)
      } else {
        res.status(201).json(provinces)
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = new LocationController()