# Hệ thống quản lý các đại lý
Hai module đầu tiên của hệ thống, viết theo quy chuẩn code và kiểm thử bằng Jest/Supertest:

- **Xác thực:** đăng ký, đăng nhập tài khoản theo 4 vai trò.
- **Quản lý đại lý:** tiếp nhận (UC01), cập nhật (UC02), ngừng hoạt động (UC03), tra cứu (UC12), áp dụng QĐ1.

## Cài đặt và chạy

```bash
npm install          # cài express, bcryptjs, jest, supertest, eslint
npm test             # chạy kiểm thử
npm run test:coverage
npm run lint         # kiểm tra quy chuẩn code bằng ESLint
npm start            # chạy máy chủ tại http://localhost:3000
```

> Trên Windows PowerShell, nếu `npm` bị chặn bởi Execution Policy thì dùng `npm.cmd`.

## Cấu trúc thư mục

```
QuanLyDaiLy/
├── app.js                     # Khởi tạo Express, gắn middleware và routes
├── server.js                  # Điểm khởi chạy máy chủ
├── config/constants.js        # Hằng số nghiệp vụ (QĐ1, vai trò, quy tắc mật khẩu)
├── errors/AppError.js         # Các lớp lỗi có sẵn HTTP status và mã lỗi
├── middlewares/
│   ├── errorHandler.js        # Xử lý lỗi tập trung
│   └── securityHeaders.js     # Header bảo mật (chống XSS, clickjacking)
├── repositories/
│   ├── userRepository.js      # Lưu người dùng (bộ nhớ)
│   ├── agencyRepository.js    # Lưu đại lý (bộ nhớ)
│   └── sql/agencyRepository.mysql.js  # Mẫu truy vấn MySQL có tham số (chống SQLi)
├── routes/
│   ├── authRoutes.js
│   └── agencyRoutes.js
├── services/
│   ├── authService.js         # Nghiệp vụ đăng ký / đăng nhập
│   └── agencyService.js       # Nghiệp vụ quản lý đại lý
├── utils/
│   ├── asyncHandler.js
│   ├── htmlEscape.js
│   └── validators.js
├── tests/
│   ├── auth.test.js
│   ├── agency.test.js
│   └── utils.test.js
├── docs/CODE_REVIEW.md        # Checklist và nhận xét peer review
└── .github/pull_request_template.md
```

## Danh sách API

| Phương thức | Đường dẫn | Use Case | Kết quả thành công |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký | 201 |
| POST | `/api/auth/login` | Đăng nhập | 200 |
| GET | `/api/agencies?keyword=&district=&agencyType=` | UC12 – Tra cứu | 200 |
| GET | `/api/agencies/:agencyId` | UC12 – Xem chi tiết | 200 |
| POST | `/api/agencies` | UC01 – Tiếp nhận đại lý | 201 |
| PUT | `/api/agencies/:agencyId` | UC02 – Cập nhật | 200 |
| PATCH | `/api/agencies/:agencyId/deactivate` | UC03 – Ngừng hoạt động | 200 |

Mã lỗi: 400 dữ liệu không hợp lệ · 401 sai thông tin đăng nhập · 404 không tìm thấy · 409 trùng dữ liệu · 422 vi phạm quy định (QĐ1, còn nợ) · 500 lỗi hệ thống.

### Ví dụ tiếp nhận đại lý

```http
POST /api/agencies
Content-Type: application/json

{
  "agencyName": "Đại lý Minh Phát",
  "agencyType": 1,
  "phoneNumber": "0903112233",
  "address": "48 Lê Lợi, Phường Bến Nghé",
  "district": 1,
  "receivedDate": "2026-10-15"
}
```

## Quy trình Git

```bash
git switch develop && git pull origin develop
git switch -c feature/auth-module
git add .
git commit -m "feat: implement authentication API and tests"
git push -u origin feature/auth-module
# Tạo Pull Request: base develop <- compare feature/auth-module
```
# 👥 Thành viên nhóm & Phân công

**Nhóm 02 – Lớp N2.2** · Môn Công nghệ phần mềm · GVHD: Nguyễn Thanh Phong

| STT | Họ và tên | MSSV | Vai trò | Phụ trách |
|:---:|---|:---:|---|---|
| 1 | Trương Thành Tín | 52400247 | Nhóm trưởng / Tester | Quản lý dự án, kịch bản kiểm thử và unit test (`backend/tests/`) |
| 2 | Trần Thái Thông | 52400242 | Backend 1 | Module Đại lý (BM1, BM3, QĐ1) và Báo cáo tháng (BM5) |
| 3 | Nguyễn Anh Hào | 52400186 | UI / Frontend | Thiết kế giao diện (`frontend/`): Dashboard và các màn hình BM1–BM5, QĐ6 |
| 4 | Đặng Vĩnh Quang | 52400228 | Backend 2 | Module Xuất hàng (BM2, QĐ2), Thu tiền (BM4, QĐ4), Thay đổi quy định (QĐ6) |
| 5 | Lê Trung Hiếu | 52400188 | BA (Business Analyst) | Tài liệu phân tích, đặc tả yêu cầu, User Stories (`docs/`) |