const express = require("express");
const router = express.Router();

const staffController = require("../../app/controllers/StaffController");

router.get("/login", staffController.login);
router.post("/signin", staffController.signin);
router.get("/profile/:id", staffController.profile);
router.post("/create", staffController.create);
router.patch("/change-password", staffController.changePassword);
router.patch("/change-info", staffController.changeInfo);
router.get("/positions", staffController.positions);
router.post("/add-position", staffController.addPosition);
router.get("/", staffController.get);

module.exports = router;
