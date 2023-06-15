const express = require("express");
const router = express.Router();

const orderController = require("../../app/controllers/OrderController");

router.post("/create", orderController.create);
router.patch("/edit", orderController.edit);
router.get("/", orderController.get);

module.exports = router;
