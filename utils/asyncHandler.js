/**
 * Bọc route handler bất đồng bộ để lỗi (Promise bị reject) được chuyển
 * đến middleware xử lý lỗi tập trung, thay vì lặp lại try...catch ở mọi route.
 *
 * @param {Function} handler async (req, res, next) => {...}
 * @returns {Function} Middleware Express.
 */
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
