# Hệ Thống Quản Lý Các Đại Lý
> **Đề tài giữa kỳ - Môn Công nghệ Phần mềm (Lớp N2.2 - TDTU)**

---

## 1. Thành viên nhóm & Phân công nhiệm vụ

| STT | Họ và tên | MSSV | Vai trò chính | Nhiệm vụ phụ trách trong code |
|:---:|---|:---:|---|---|
| 1 | **Trương Thành Tín** | 52400247 | **Nhóm trưởng / Tester** | Quản lý dự án, viết kịch bản và unit test tại `backend/tests/` |
| 2 | **Trần Thái Thông** | 52400242 | **Backend 1** | Module Đại lý (BM1, BM3, QĐ1) & Báo cáo tháng (BM5) |
| 3 | **Nguyễn Anh Hào** | 52400186 | **UI / Frontend** | Thiết kế giao diện tại `frontend/` (Dashboard + 6 biểu mẫu BM1 - BM6) |
| 4 | **Đặng Vĩnh Quang** | 52400228 | **Backend 2** | Module Xuất hàng (BM2, QĐ2), Thu tiền (BM4, QĐ4), Thay đổi quy định (BM6, QĐ6) |
| 5 | **Lê Trung Hiếu** | 52400188 | **BA (Business Analyst)** | Quản lý tài liệu phân tích, đặc tả yêu cầu và User Stories tại `docs/` |

---

## 2. Cấu trúc thư mục dự án

```text
QuanLyDaiLys/
├── docs/                                # Tài liệu đặc tả & phân tích hệ thống (Lê Trung Hiếu)
│   ├── charter_and_analysis.md          # Biên bản điều lệ, FR, NFR, BR, User Stories
│   └── api_spec.md                      # Đặc tả các endpoint API
│
├── backend/                             # Mã nguồn Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/                      # Cấu hình CSDL & môi trường
│   │   │   └── database.js
│   │   ├── controllers/                 # Tầng tiếp nhận request & response
│   │   │   ├── agency.controller.js     # [Thông]: Controller đại lý
│   │   │   ├── export.controller.js     # [Quang]: Controller xuất hàng
│   │   │   ├── receipt.controller.js    # [Quang]: Controller thu tiền
│   │   │   ├── report.controller.js     # [Thông]: Controller báo cáo
│   │   │   └── rule.controller.js       # [Quang]: Controller quy định
│   │   ├── services/                    # Tầng xử lý nghiệp vụ & Business Rules
│   │   │   ├── agency.service.js        # [Thông]: Tiếp nhận & tra cứu đại lý
│   │   │   ├── export.service.js        # [Quang]: Xuất hàng & kiểm tra hạn mức nợ
│   │   │   ├── receipt.service.js       # [Quang]: Thu tiền & cấn trừ nợ
│   │   │   ├── report.service.js        # [Thông]: Tính toán báo cáo doanh số & nợ
│   │   │   └── rule.service.js          # [Quang]: Thay đổi quy định QĐ6
│   │   ├── routes/                      # Định tuyến API
│   │   │   ├── agency.routes.js
│   │   │   ├── export.routes.js
│   │   │   ├── receipt.routes.js
│   │   │   ├── report.routes.js
│   │   │   ├── rule.routes.js
│   │   │   └── index.js
│   │   └── server.js                    # Entry point khởi động Backend
│   ├── tests/                           # Kịch bản kiểm thử (Trương Thành Tín)
│   │   ├── agency.test.js
│   │   ├── export.test.js
│   │   └── receipt.test.js
│   ├── .env.example
│   └── package.json
│
├── frontend/                            # Giao diện người dùng thuần (Nguyễn Anh Hào)
│   ├── index.html                       # Trang chủ / Dashboard tổng quan
│   ├── css/
│   │   └── style.css                    # CSS giao diện
│   ├── js/
│   │   ├── api.js                       # Module fetch gọi API từ backend
│   │   └── main.js                      # Logic JavaScript chung
│   └── pages/                           # Các trang biểu mẫu theo yêu cầu
│       ├── tiep-nhan-dai-ly.html        # BM1: Hồ sơ tiếp nhận đại lý (QĐ1)
│       ├── xuat-hang.html               # BM2: Lập phiếu xuất hàng (QĐ2, BR02, BR03)
│       ├── tra-cuu-dai-ly.html          # BM3: Danh sách & tra cứu đại lý
│       ├── thu-tien.html                # BM4: Phiếu thu tiền (QĐ4, BR06)
│       ├── bao-cao.html                 # BM5: Báo cáo tháng (doanh số & công nợ)
│       └── quy-dinh.html                # BM6: Thay đổi các quy định hệ thống (QĐ6)
│
├── .gitignore
└── README.md
```

---

## 3. Hướng dẫn khởi động dự án

### Cài đặt thư viện cho Backend
```bash
cd backend
npm install
```

### Chạy Backend ở chế độ phát triển
```bash
cd backend
npm run dev
# Server lắng nghe tại: http://localhost:5000
# Frontend có thể truy cập trực tiếp tại http://localhost:5000 hoặc mở trực tiếp các file .html trong frontend/
```

### Chạy kiểm thử (Tester)
```bash
cd backend
npm test
```
