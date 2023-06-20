const express = require("express");
const router = express.Router();

const commodityController = require("../../app/controllers/CommodityController");

router.post("/create", commodityController.create);
router.post("/create-type", commodityController.createCommodityType);
router.post("/create-unit", commodityController.createCommodityUnit);
router.get("/type", commodityController.getCommodityType);
router.get("/unit", commodityController.getCommodityUnit);
router.patch("/change-info", commodityController.changeInfo);
router.patch("/delete", commodityController.delete);
router.patch("/undelete", commodityController.undelete);
router.delete("/destroy", commodityController.destroy);
router.get("/:id", commodityController.changeInfo);
router.get("/", commodityController.commodities);

module.exports = router;
