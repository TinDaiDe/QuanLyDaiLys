/**
 * Định tuyến API xác thực: /api/auth/*
 * Route chỉ nhận request và trả response; toàn bộ nghiệp vụ nằm ở authService,
 * mọi lỗi được chuyển về errorHandler qua asyncHandler.
 */

const express = require("express");
const authService = require("../services/authService");
const { asyncHandler } = require("../utils/asyncHandler");

const authRouter = express.Router();

/** POST /api/auth/register - Đăng ký tài khoản. */
authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const createdUser = await authService.register(req.body || {});
    res.status(201).json({ message: "Đăng ký thành công", data: createdUser });
  })
);

/** POST /api/auth/login - Đăng nhập. */
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const loggedInUser = await authService.login(req.body || {});
    res.status(200).json({ message: "Đăng nhập thành công", data: loggedInUser });
  })
);

module.exports = authRouter;
