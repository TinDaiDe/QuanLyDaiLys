/**
 * Mã hóa ký tự đặc biệt HTML trước khi chèn dữ liệu người dùng vào trang.
 *
 * Dùng ở tầng giao diện khi bắt buộc phải dựng chuỗi HTML (ví dụ xuất báo cáo
 * HTML). Khi thao tác DOM trực tiếp, ưu tiên element.textContent thay vì
 * innerHTML - không cần gọi hàm này.
 */

const HTML_ENTITY_MAP = Object.freeze({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
});

/**
 * @param {unknown} value Giá trị cần hiển thị.
 * @returns {string} Chuỗi an toàn để chèn vào nội dung HTML.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (character) => HTML_ENTITY_MAP[character]);
}

module.exports = { escapeHtml };
