const express = require("express");
const router = express.Router();

const transactionController = require("../../app/controllers/TransactionController");

router.post("/type", transactionController.addTransactionType);
router.get("/types", transactionController.getTransactionTypes);

module.exports = router;
