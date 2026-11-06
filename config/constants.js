/**
 * Các hằng số cấu hình nghiệp vụ của hệ thống.
 * Giá trị mặc định lấy theo QĐ1 và QĐ2 của đề tài; Quản trị viên có thể
 * thay đổi qua UC15 (Thay đổi quy định hệ thống) ở các phiên bản sau.
 */

/** QĐ1 - Quy định về đại lý. */
const AGENCY_RULES = Object.freeze({
  AGENCY_TYPES: Object.freeze([1, 2]),
  DISTRICT_COUNT: 20,
  MAX_AGENCIES_PER_DISTRICT: 4
});

/** Trạng thái hoạt động của đại lý. */
const AGENCY_STATUS = Object.freeze({
  ACTIVE: "HOAT_DONG",
  INACTIVE: "NGUNG_HOAT_DONG"
});

/** Vai trò người dùng (tương ứng 4 actor trong Use Case Diagram). */
const USER_ROLES = Object.freeze({
  SALES_STAFF: "NV_KINH_DOANH",
  WAREHOUSE_STAFF: "NV_XUAT_HANG",
  ACCOUNTANT: "KE_TOAN",
  ADMIN: "QUAN_TRI_VIEN"
});

/** Quy tắc mật khẩu. bcrypt chỉ xử lý tối đa 72 byte đầu tiên. */
const PASSWORD_RULES = Object.freeze({
  MIN_LENGTH: 8,
  MAX_LENGTH: 72,
  BCRYPT_SALT_ROUNDS: 10
});

/** Giới hạn độ dài các trường văn bản để chặn dữ liệu bất thường. */
const TEXT_LIMITS = Object.freeze({
  FULL_NAME_MAX: 100,
  AGENCY_NAME_MAX: 100,
  ADDRESS_MAX: 200,
  SEARCH_KEYWORD_MAX: 50
});

/** Giới hạn kích thước body của request JSON. */
const REQUEST_BODY_LIMIT = "10kb";

module.exports = {
  AGENCY_RULES,
  AGENCY_STATUS,
  USER_ROLES,
  PASSWORD_RULES,
  TEXT_LIMITS,
  REQUEST_BODY_LIMIT
};
