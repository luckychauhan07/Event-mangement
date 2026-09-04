const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify", authController.verifyOtp);
authRouter.post("/resend-otp", authController.resendOtp);
authRouter.post("/forgot-password", authController.requestPasswordReset);
authRouter.post("/reset-password", authController.resetPassword);

module.exports = authRouter;
