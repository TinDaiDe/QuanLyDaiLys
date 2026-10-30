/**
 * Khởi tạo ứng dụng Express.
 * Tách riêng khỏi server.js để Supertest có thể kiểm thử mà không mở cổng mạng.
 */

const express = require("express");
const authRouter = require("./routes/authRoutes");
const agencyRouter = require("./routes/agencyRoutes");
const { securityHeaders } = require("./middlewares/securityHeaders");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");
const { REQUEST_BODY_LIMIT } = require("./config/constants");

const app = express();

app.disable("x-powered-by"); // Không để lộ công nghệ máy chủ đang dùng.
app.use(securityHeaders);
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));

app.use("/api/auth", authRouter);
app.use("/api/agencies", agencyRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
