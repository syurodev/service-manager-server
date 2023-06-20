const express = require("express");
const router = express.Router();

const contractController = require("../../app/controllers/ContractController");

router.post("/type", contractController.addContractType);
router.get("/types", contractController.getContractTypes);

router.post("/create", contractController.create);
router.patch("/change-info", contractController.changeInfo);
router.patch("/delete", contractController.delete);
router.patch("/undelete", contractController.undelete);
router.delete("/destroy", contractController.destroy);
router.get("/:id", contractController.info);
router.get("/", contractController.get);

module.exports = router;
