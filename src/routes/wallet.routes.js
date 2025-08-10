const express = require("express");
const router = express.Router();
const { addMoney } = require("../controllers/wallet.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/add", protect, addMoney);

module.exports = router;
