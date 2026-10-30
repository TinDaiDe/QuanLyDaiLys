/**
 * Các lớp lỗi nghiệp vụ dùng chung.
 *
 * Mỗi lớp mang sẵn HTTP status code và mã lỗi (errorCode) cố định,
 * nhờ đó middleware xử lý lỗi không phải so sánh chuỗi error.message
 * để chọn mã HTTP (góp ý code review số 1 trong đề Lab 08).
 */

class AppError extends Error {
  /**
   * @param {string} message    Thông báo hiển thị cho người dùng.
   * @param {number} statusCode HTTP status code tương ứng.
   * @param {string} errorCode  Mã lỗi ổn định để client xử lý.
   */
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/** Dữ liệu đầu vào sai kiểu, thiếu hoặc sai định dạng (HTTP 400). */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

/** Sai thông tin đăng nhập (HTTP 401). */
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

/** Không tìm thấy tài nguyên (HTTP 404). */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, "NOT_FOUND");
  }
}

/** Dữ liệu bị trùng, ví dụ tên đăng nhập đã tồn tại (HTTP 409). */
class ConflictError extends AppError {
  constructor(message, errorCode = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

/** Vi phạm quy định nghiệp vụ QĐ1–QĐ6 (HTTP 422). */
class BusinessRuleError extends AppError {
  constructor(message, errorCode = "BUSINESS_RULE_VIOLATION") {
    super(message, 422, errorCode);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  BusinessRuleError
};
