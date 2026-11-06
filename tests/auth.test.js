/**
 * Kiểm thử API Đăng ký / Đăng nhập.
 * Mỗi test tự chuẩn bị dữ liệu (beforeEach xóa kho) nên các test độc lập,
 * có thể chạy riêng lẻ hoặc theo bất kỳ thứ tự nào.
 */

const request = require("supertest");
const app = require("../app");
const userRepository = require("../repositories/userRepository");
const { USER_ROLES } = require("../config/constants");

const VALID_ACCOUNT = Object.freeze({
  username: "nv.kinhdoanh01",
  password: "DaiLy@2026",
  fullName: "Lê Trung Híu",
  role: USER_ROLES.SALES_STAFF
});

function registerAccount(overrides = {}) {
  return request(app)
    .post("/api/auth/register")
    .send({ ...VALID_ACCOUNT, ...overrides });
}

function loginAccount(credentials) {
  return request(app).post("/api/auth/login").send(credentials);
}

beforeEach(() => {
  userRepository.clear();
});

describe("POST /api/auth/register", () => {
  test("đăng ký thành công và không trả về passwordHash", async () => {
    const response = await registerAccount();

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      username: VALID_ACCOUNT.username,
      fullName: VALID_ACCOUNT.fullName,
      role: USER_ROLES.SALES_STAFF
    });
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(response.body.data.password).toBeUndefined();
  });

  test("chuẩn hóa tên đăng nhập: bỏ khoảng trắng hai đầu và chuyển chữ thường", async () => {
    const response = await registerAccount({ username: "  NV.KinhDoanh01  " });

    expect(response.status).toBe(201);
    expect(response.body.data.username).toBe("nv.kinhdoanh01");
  });

  test("từ chối đăng ký trùng tên (409)", async () => {
    await registerAccount();
    const response = await registerAccount({ username: "NV.KINHDOANH01" });

    expect(response.status).toBe(409);
    expect(response.body.errorCode).toBe("USERNAME_TAKEN");
  });

  test("hai yêu cầu đăng ký đồng thời cùng tên chỉ tạo được một tài khoản", async () => {
    const [firstResponse, secondResponse] = await Promise.all([
      registerAccount(),
      registerAccount()
    ]);
    const statusCodes = [firstResponse.status, secondResponse.status].sort();

    expect(statusCodes).toEqual([201, 409]);
  });

  test.each([
    ["mật khẩu quá ngắn", { password: "Ab1" }],
    ["mật khẩu không có chữ số", { password: "KhongCoSo" }],
    ["thiếu mật khẩu", { password: undefined }],
    ["tên đăng nhập chỉ có khoảng trắng", { username: "   " }],
    ["tên đăng nhập chứa ký tự đặc biệt", { username: "admin' OR '1'='1" }],
    ["tên đăng nhập không phải chuỗi", { username: 12345 }],
    ["họ tên chứa thẻ script (XSS)", { fullName: "<script>alert(1)</script>" }],
    ["vai trò không hợp lệ", { role: "SUPER_ADMIN" }]
  ])("từ chối dữ liệu không hợp lệ: %s (400)", async (caseName, invalidField) => {
    const response = await registerAccount(invalidField);

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe("VALIDATION_ERROR");
  });

  test("từ chối mật khẩu dài quá 72 byte", async () => {
    const response = await registerAccount({ password: `A1${"x".repeat(80)}` });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await registerAccount();
  });

  test("đăng nhập thành công", async () => {
    const response = await loginAccount({
      username: VALID_ACCOUNT.username,
      password: VALID_ACCOUNT.password
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Đăng nhập thành công");
    expect(response.body.data.role).toBe(USER_ROLES.SALES_STAFF);
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  test("từ chối mật khẩu sai (401)", async () => {
    const response = await loginAccount({
      username: VALID_ACCOUNT.username,
      password: "SaiMatKhau99"
    });

    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe("INVALID_CREDENTIALS");
  });

  test("tài khoản không tồn tại trả về cùng thông báo với sai mật khẩu", async () => {
    const wrongPasswordResponse = await loginAccount({
      username: VALID_ACCOUNT.username,
      password: "SaiMatKhau99"
    });
    const unknownUserResponse = await loginAccount({
      username: "khong.ton.tai",
      password: "SaiMatKhau99"
    });

    expect(unknownUserResponse.status).toBe(401);
    expect(unknownUserResponse.body.message).toBe(wrongPasswordResponse.body.message);
  });

  test("từ chối khi thiếu thông tin đăng nhập (400)", async () => {
    const response = await loginAccount({ username: VALID_ACCOUNT.username });

    expect(response.status).toBe(400);
  });
});

describe("Xử lý lỗi chung của ứng dụng", () => {
  test("JSON sai cú pháp trả về 400 thay vì làm sập máy chủ", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"username": "abc",');

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe("INVALID_JSON");
  });

  test("đường dẫn không tồn tại trả về 404", async () => {
    const response = await request(app).get("/api/khong-ton-tai");

    expect(response.status).toBe(404);
  });

  test("phản hồi có các header bảo mật và không lộ X-Powered-By", async () => {
    const response = await request(app).get("/api/agencies");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["content-security-policy"]).toContain("default-src 'none'");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });
});
