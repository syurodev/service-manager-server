const provinceSchema = require("../models/Provinces")
const districtsSchema = require("../models/Districts")
const wardsSchema = require("../models/Wards")

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

  async getListDistricts(req, res) {
    const { q } = req.query
    const query = {}

    if (q) {
      query.name = { $regex: q, $options: "i" }
    }

    try {
      const districts = await districtsSchema.find(query)
      if (districts.length > 0) {
        res.status(201).json(districts)
      } else {
        res.status(201).json(districts)
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }

  async getListWards(req, res) {
    const { q } = req.query
    const query = {}

    if (q) {
      query.name = { $regex: q, $options: "i" }
    }

    try {
      const wards = await wardsSchema.find(query)
      if (wards.length > 0) {
        res.status(201).json(wards)
      } else {
        res.status(201).json(wards)
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Internal Server Error" })
    }
  }
}

module.exports = new LocationController()