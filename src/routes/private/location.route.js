const express = require("express");
const router = express.Router();

const LocationController = require("../../app/controllers/LocationController");

router.get("/province", LocationController.getListProvince);

module.exports = router;
