const express = require("express");
const router = express.Router();

const customerController = require("../../app/controllers/CustomerController");

router.post("/type", customerController.addCustomerType);
router.get("/types", customerController.getCustomerTypes);

router.post("/create", customerController.create);
router.patch("/change-info", customerController.changeInfo);
router.patch("/delete", customerController.delete);
router.patch("/undelete", customerController.undelete);
router.delete("/destroy", customerController.destroy);
router.get("/:id", customerController.info);
router.get("/", customerController.get);

module.exports = router;
