const express = require("express");
const router = express.Router();

const LocationController = require("../../app/controllers/LocationController");

router.get("/province", LocationController.getListProvince);
router.get("/district", LocationController.getListDistricts);
router.get("/ward", LocationController.getListWards);

module.exports = router;
