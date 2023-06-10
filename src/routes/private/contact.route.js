const express = require("express");
const router = express.Router();

const contactController = require("../../app/controllers/ContactController");

router.post("/create", contactController.create);
router.patch("/change-info", contactController.changeInfo);
router.patch("/delete", contactController.delete);
router.patch("/undelete", contactController.undelete);
router.delete("/destroy", contactController.destroy);
router.get("/:id", contactController.info);
router.get("/", contactController.get);

module.exports = router;
