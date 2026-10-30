/**
 * Các hàm kiểm tra và chuẩn hóa dữ liệu đầu vào.
 *
 * Nguyên tắc: kiểm tra theo danh sách cho phép (whitelist) - chỉ chấp nhận
 * các ký tự hợp lệ thay vì cố liệt kê ký tự nguy hiểm. Các ký tự như
 * < > " ` ; không có trong whitelist nên chuỗi chứa thẻ <script> bị từ chối
 * ngay tại máy chủ (một lớp phòng chống XSS).
 */

const { ValidationError } = require("../errors/AppError");

/** Chữ cái (kể cả tiếng Việt có dấu), chữ số và một số dấu câu thông dụng. */
const PERSON_OR_AGENCY_NAME_PATTERN = /^[\p{L}\p{N} .,'&()-]+$/u;
const ADDRESS_PATTERN = /^[\p{L}\p{N} .,/#-]+$/u;
const PHONE_NUMBER_PATTERN = /^0\d{9}$/;
const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Bỏ khoảng trắng hai đầu và gộp nhiều khoảng trắng liên tiếp thành một. */
function normalizeWhitespace(text) {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Bắt buộc giá trị là chuỗi khác rỗng; trả về chuỗi đã chuẩn hóa khoảng trắng.
 * @throws {ValidationError}
 */
function requireText(value, fieldLabel) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${fieldLabel} là bắt buộc`);
  }
  return normalizeWhitespace(value);
}

/**
 * Kiểm tra độ dài tối đa và mẫu ký tự cho phép.
 * @throws {ValidationError}
 */
function validateText(text, { fieldLabel, maxLength, pattern }) {
  if (text.length > maxLength) {
    throw new ValidationError(`${fieldLabel} không được vượt quá ${maxLength} ký tự`);
  }
  if (!pattern.test(text)) {
    throw new ValidationError(`${fieldLabel} chứa ký tự không hợp lệ`);
  }
  return text;
}

/**
 * Chuyển giá trị thành số nguyên trong khoảng [min, max].
 * Chấp nhận số hoặc chuỗi số (dữ liệu từ query string luôn là chuỗi).
 * @throws {ValidationError}
 */
function parseIntegerInRange(value, { fieldLabel, min, max }) {
  const numberValue = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw new ValidationError(`${fieldLabel} phải là số nguyên từ ${min} đến ${max}`);
  }
  return numberValue;
}

/**
 * Kiểm tra ngày dạng YYYY-MM-DD, có thật trên lịch và không ở tương lai.
 * @throws {ValidationError}
 */
function parsePastOrTodayDate(value, fieldLabel) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    throw new ValidationError(`${fieldLabel} phải có định dạng YYYY-MM-DD`);
  }
  const parsedDate = new Date(`${value}T00:00:00Z`);
  const isRealCalendarDate =
    !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
  if (!isRealCalendarDate) {
    throw new ValidationError(`${fieldLabel} không phải là ngày hợp lệ`);
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  if (value > todayIso) {
    throw new ValidationError(`${fieldLabel} không được ở tương lai`);
  }
  return value;
}

module.exports = {
  PERSON_OR_AGENCY_NAME_PATTERN,
  ADDRESS_PATTERN,
  PHONE_NUMBER_PATTERN,
  USERNAME_PATTERN,
  normalizeWhitespace,
  requireText,
  validateText,
  parseIntegerInRange,
  parsePastOrTodayDate
};
