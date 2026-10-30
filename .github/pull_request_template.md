## Mô tả thay đổi

<!-- Tóm tắt chức năng đã làm, Use Case liên quan (UC01, UC02...) -->

## Loại thay đổi

- [ ] feat – Tính năng mới
- [ ] fix – Sửa lỗi
- [ ] refactor – Tái cấu trúc, không đổi chức năng
- [ ] test – Bổ sung kiểm thử
- [ ] docs – Tài liệu

## Kết quả kiểm thử

```
npm test -- --coverage
Tests:      __ passed, __ total
Statements: __% | Branches: __% | Functions: __% | Lines: __%
```

## Checklist trước khi yêu cầu review

- [ ] Đặt tên theo quy ước: camelCase (biến, hàm), PascalCase (class), UPPER_SNAKE_CASE (hằng số)
- [ ] Hàm ngắn, làm một việc; không lặp code
- [ ] Mọi lỗi được ném bằng lớp lỗi trong `errors/AppError.js`, không so sánh `error.message`
- [ ] Dữ liệu đầu vào được kiểm tra ở máy chủ (kiểu, độ dài, ký tự cho phép)
- [ ] Không nối chuỗi vào câu SQL; chỉ dùng truy vấn có tham số `?`
- [ ] Không trả `passwordHash` hay thông tin nội bộ trong phản hồi
- [ ] `npm test` và `npm run lint` chạy thành công

## Điểm cần người review chú ý

<!-- Ví dụ: cách kiểm tra QĐ1 khi đổi quận, xử lý đăng ký đồng thời... -->
