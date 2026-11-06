/**
 * Kho lưu trữ người dùng (lưu trong bộ nhớ, dùng cho bài thực hành).
 *
 * Dùng Map với khóa là username để tra cứu O(1) thay vì duyệt mảng O(n).
 * Hàm create() tự kiểm tra trùng, đóng vai trò như ràng buộc UNIQUE của
 * cơ sở dữ liệu nên vẫn an toàn khi có nhiều yêu cầu đăng ký đồng thời.
 * Khi chuyển sang MySQL, giữ nguyên giao diện các hàm và dùng truy vấn
 * có tham số (xem repositories/sql/agencyRepository.mysql.js).
 */

const { ConflictError } = require("../errors/AppError");

const usersByUsername = new Map();
let nextUserId = 1;

/** Trả về bản sao để nơi gọi không sửa trực tiếp dữ liệu đang lưu. */
function cloneUser(user) {
  return user ? { ...user } : null;
}

async function findByUsername(username) {
  return cloneUser(usersByUsername.get(username));
}

/**
 * @param {{username: string, passwordHash: string, fullName: string, role: string}} userData
 * @throws {ConflictError} Khi username đã tồn tại.
 */
async function create(userData) {
  if (usersByUsername.has(userData.username)) {
    throw new ConflictError("Tên đăng nhập đã tồn tại", "USERNAME_TAKEN");
  }
  const user = { id: nextUserId++, ...userData, createdAt: new Date().toISOString() };
  usersByUsername.set(user.username, user);
  return cloneUser(user);
}

/** Xóa toàn bộ dữ liệu - chỉ dùng trong kiểm thử. */
function clear() {
  usersByUsername.clear();
  nextUserId = 1;
}

module.exports = { findByUsername, create, clear };
