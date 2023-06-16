const express = require("express");
const router = express.Router();

const orderController = require("../../app/controllers/OrderController");

router.post("/create", orderController.create);
router.patch("/edit", orderController.edit);
router.patch("/delete", orderController.delete);
router.patch("/undelete", orderController.undelete);
router.delete("/destroy", orderController.destroy);
router.get("/", orderController.get);

module.exports = router;
