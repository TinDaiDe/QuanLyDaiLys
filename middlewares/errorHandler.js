/**
 * Middleware xử lý lỗi tập trung.
 *
 * - Lỗi nghiệp vụ (AppError): trả đúng status code và mã lỗi đã khai báo.
 * - JSON sai cú pháp: trả 400.
 * - Lỗi không lường trước: ghi log phía máy chủ, chỉ trả thông báo chung
 *   cho client để không lộ stack trace hay thông tin nội bộ.
 */

const { AppError, NotFoundError } = require("../errors/AppError");

const INTERNAL_ERROR_MESSAGE = "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau";

/** Bắt các đường dẫn API không tồn tại. */
function notFoundHandler(req, res, next) {
  next(new NotFoundError("Không tìm thấy đường dẫn API"));
}

// Express nhận diện middleware lỗi qua đúng 4 tham số, nên giữ nguyên `next`.
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      errorCode: "INVALID_JSON",
      message: "Dữ liệu gửi lên không đúng định dạng JSON"
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      errorCode: "PAYLOAD_TOO_LARGE",
      message: "Dữ liệu gửi lên vượt quá kích thước cho phép"
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      message: error.message
    });
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("[Unhandled error]", error);
  }
  return res.status(500).json({
    errorCode: "INTERNAL_ERROR",
    message: INTERNAL_ERROR_MESSAGE
  });
}

module.exports = { notFoundHandler, errorHandler, INTERNAL_ERROR_MESSAGE };
