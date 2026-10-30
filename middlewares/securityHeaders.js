/**
 * Thêm các HTTP header bảo mật cơ bản cho mọi phản hồi của API.
 *
 * - X-Content-Type-Options: nosniff  -> trình duyệt không tự đoán kiểu nội dung,
 *   tránh việc phản hồi JSON bị diễn giải thành HTML/JS.
 * - Content-Security-Policy: default-src 'none' -> API chỉ trả JSON, không cho
 *   phép tải hay thực thi bất kỳ script nào (giảm thiểu XSS).
 * - X-Frame-Options: DENY -> chống nhúng trang vào iframe (clickjacking).
 *
 * Ở môi trường thực tế có thể thay bằng thư viện helmet.
 */
function securityHeaders(req, res, next) {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.set("X-Frame-Options", "DENY");
  next();
}

module.exports = { securityHeaders };
