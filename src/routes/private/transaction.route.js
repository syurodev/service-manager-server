const express = require("express");
const router = express.Router();

const transactionController = require("../../app/controllers/TransactionController");

router.post("/type", transactionController.addTransactionType);
router.get("/types", transactionController.getTransactionTypes);

router.post("/status", transactionController.addTransactionStatus);
router.get("/status", transactionController.getTransactionStatus);

router.post("/create", transactionController.create)
router.patch("/delete", transactionController.delete);
router.patch("/undelete", transactionController.undelete);
router.delete("/destroy", transactionController.destroy);
router.patch("/edit", transactionController.edit);
router.get("/:id", transactionController.info)
router.get("/", transactionController.get)

module.exports = router;
