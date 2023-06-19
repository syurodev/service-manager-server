const express = require("express");
const router = express.Router();

const contractController = require("../../app/controllers/ContractController");

router.post("/create", contractController.create);
router.get("/:id", contractController.info);
router.get("/", contractController.get);

module.exports = router;
