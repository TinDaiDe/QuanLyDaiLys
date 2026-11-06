# Peer Code Review – Lab 08

## 1. Phân công

| Pull Request | Nhánh | Người tạo | Người review |
|---|---|---|---|
| PR #1 – Authentication API | `feature/auth-module` → `develop` | Đặng Vĩnh Quang | Nguyễn Anh Hào, Trần Thái Thông |
| PR #2 – Agency management API | `feature/agency-module` → `develop` | Trần Thái Thông | Đặng Vĩnh Quang, Lê Trung Hiếu |
| Cả hai PR (phần `tests/`) | | | Trương Thành Tín |

Mỗi người review ghi **ít nhất 3 nhận xét** trực tiếp trên dòng code (tab *Files changed* → dấu `+`).

## 2. Checklist review

- [ ] Tên biến/hàm/hằng đúng quy ước, đọc là hiểu ý nghĩa
- [ ] Mỗi hàm làm một việc, không quá 50 dòng, không quá 4 tham số
- [ ] Lỗi được ném bằng lớp trong `errors/AppError.js`; không nuốt lỗi
- [ ] Dữ liệu đầu vào được kiểm tra ở máy chủ (kiểu, độ dài, whitelist ký tự)
- [ ] Không nối chuỗi vào SQL; không trả thông tin nhạy cảm (passwordHash, stack trace)
- [ ] Có kiểm thử cho cả trường hợp đúng và trường hợp lỗi
- [ ] Không có đoạn code thừa, code bị comment bỏ, `console.log` gỡ lỗi

## 3. Nhận xét đề xuất

Các nhận xét dưới đây là điểm cần cải thiện thật trong mã nguồn hiện tại. Người review đăng lên GitHub tại đúng dòng code tương ứng.

### PR #1 – feature/auth-module

| # | Người review | Vị trí | Loại | Nhận xét | Đề xuất |
|---|---|---|---|---|---|
| 1 | Hào | `services/authService.js` – `login()` | Bảo mật | Không giới hạn số lần đăng nhập sai, có thể bị dò mật khẩu (brute force). | Thêm `express-rate-limit` cho `/api/auth/login` (ví dụ 5 lần/15 phút/IP) hoặc khóa tạm tài khoản. |
| 2 | Hào | `services/authService.js` – `getDummyPasswordHash()` | Hiệu năng | Hash giả chỉ được tạo ở lần đầu có người đăng nhập bằng tài khoản không tồn tại, nên request đó chậm gấp đôi các request sau. | Tạo sẵn hash giả khi khởi động ứng dụng. |
| 3 | Hào | `routes/authRoutes.js` – `POST /login` | Kiến trúc | Đăng nhập chỉ trả thông tin user, chưa cấp token/phiên nên các API đại lý chưa biết ai đang gọi và chưa phân quyền theo vai trò. | Cấp JWT khi đăng nhập; thêm middleware `requireRole(...)` cho từng route. |
| 4 | Thông | `config/constants.js` – `BCRYPT_SALT_ROUNDS` | Quy chuẩn | Giá trị cost 10 bị cố định trong mã. | Đọc từ biến môi trường, mặc định 10; môi trường test dùng giá trị thấp để chạy nhanh. |
| 5 | Thông | `utils/validators.js` – `PERSON_OR_AGENCY_NAME_PATTERN` | Quy chuẩn | Một mẫu dùng chung cho họ tên người và tên đại lý, khó điều chỉnh riêng khi yêu cầu thay đổi. | Tách thành `PERSON_NAME_PATTERN` và `AGENCY_NAME_PATTERN`. |
| 6 | Thông | `repositories/userRepository.js` – `clear()` | Quy chuẩn | Hàm chỉ dành cho kiểm thử nhưng được export trong mã chạy thật, có thể bị gọi nhầm. | Dùng dependency injection để test tự tạo repository riêng, hoặc chỉ export khi `NODE_ENV === "test"`. |

### PR #2 – feature/agency-module

| # | Người review | Vị trí | Loại | Nhận xét | Đề xuất |
|---|---|---|---|---|---|
| 7 | Quang | `services/agencyService.js` – `receiveAgency()` | Lỗi đồng thời | Kiểm tra QĐ1 rồi mới tạo (check-then-act). Khi chuyển sang CSDL (mỗi truy vấn có độ trễ), hai yêu cầu cùng lúc vào quận đang có 3 đại lý có thể cùng qua bước đếm và tạo ra 5 đại lý. | Khi dùng MySQL: bọc trong transaction và `SELECT ... FOR UPDATE` khi đếm số đại lý của quận. |
| 8 | Quang | `repositories/agencyRepository.js` – `search()` | Hiệu năng | Trả toàn bộ kết quả, không phân trang; danh sách lớn sẽ chậm và tốn băng thông. | Thêm `page`, `limit` (mặc định 20, tối đa 100) và trả về `total`. |
| 9 | Quang | `repositories/agencyRepository.js` – `countActiveByDistrict()` | Hiệu năng | Duyệt toàn bộ đại lý (O(n)) mỗi lần tiếp nhận. | Với MySQL tạo index `(ma_quan, trang_thai)`; bản bộ nhớ có thể giữ bộ đếm theo quận. |
| 10 | Hiếu | `utils/validators.js` – `PHONE_NUMBER_PATTERN` | Nghiệp vụ | Chỉ nhận số 10 chữ số, số máy bàn 11 chữ số (028xxxxxxxx) bị từ chối. | Xác nhận lại với BM1; nếu cần, cho phép 10–11 chữ số. |
| 11 | Hiếu | `routes/agencyRoutes.js` – `PUT /:agencyId` | Thiết kế API | PUT bắt buộc gửi đủ hồ sơ, giao diện chỉ sửa một trường vẫn phải gửi tất cả. | Thêm `PATCH` cập nhật một phần, hoặc ghi rõ yêu cầu này trong tài liệu API. |
| 12 | Hiếu | `services/agencyService.js` – `deactivateAgency()` | Nghiệp vụ | Không lưu ai ngừng hoạt động đại lý và vào lúc nào, khó tra soát về sau. | Lưu thêm `deactivatedAt`, `deactivatedBy`. |

### Kiểm thử (cả hai PR)

| # | Người review | Vị trí | Loại | Nhận xét | Đề xuất |
|---|---|---|---|---|---|
| 13 | Tín | `tests/auth.test.js` | Kiểm thử | Trường hợp body vượt 10kb mới chỉ được kiểm thử ở mức đơn vị (`errorHandler`), chưa qua HTTP. | Thêm test gửi body > 10kb và kiểm tra mã 413. |
| 14 | Tín | `tests/agency.test.js` | Kiểm thử | Chưa có test cho hai yêu cầu tiếp nhận đồng thời cùng quận (liên quan nhận xét #7). | Thêm test dùng `Promise.all` với quận đang có 3 đại lý. |
| 15 | Tín | `tests/agency.test.js` – test "từ khóa quá dài và bộ lọc quận không hợp lệ" | Kiểm thử | Một test kiểm tra hai việc, khi lỗi khó biết nguyên nhân. | Tách thành hai test riêng. |

## 4. Xử lý góp ý

1. Người tạo PR trả lời từng nhận xét: sửa ngay trong PR hoặc tạo Issue cho sprint sau (kèm lý do).
2. Sửa code, chạy lại `npm test` và `npm run lint`.
3. `git commit -m "fix: address code review feedback"` rồi `git push`.
4. Người review kiểm tra lại, chọn **Resolve conversation** và **Approve**.
5. Merge vào `develop`.
