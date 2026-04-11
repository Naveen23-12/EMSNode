const express = require("express");
const router = express.Router();
const { login, verifyOTP, logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logout);

module.exports = router;