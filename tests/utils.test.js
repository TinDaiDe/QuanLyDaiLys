/**
 * Kiểm thử đơn vị cho các hàm tiện ích và middleware xử lý lỗi.
 */

const { escapeHtml } = require("../utils/htmlEscape");
const {
  errorHandler,
  INTERNAL_ERROR_MESSAGE
} = require("../middlewares/errorHandler");
const { BusinessRuleError } = require("../errors/AppError");

/** Tạo đối tượng response giả để kiểm thử middleware mà không cần máy chủ. */
function createMockResponse() {
  const mockResponse = {};
  mockResponse.status = jest.fn(() => mockResponse);
  mockResponse.json = jest.fn(() => mockResponse);
  return mockResponse;
}

describe("escapeHtml - phòng chống XSS khi hiển thị dữ liệu", () => {
  test("mã hóa các ký tự đặc biệt của HTML", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
    expect(escapeHtml("Tom & Jerry's")).toBe("Tom &amp; Jerry&#39;s");
  });

  test("giữ nguyên văn bản tiếng Việt thông thường", () => {
    expect(escapeHtml("Đại lý Minh Phát")).toBe("Đại lý Minh Phát");
  });

  test("trả chuỗi rỗng cho null/undefined và chuyển số thành chuỗi", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(2000000)).toBe("2000000");
  });
});

describe("errorHandler - xử lý lỗi tập trung", () => {
  test("lỗi nghiệp vụ trả đúng status code và mã lỗi đã khai báo", () => {
    const mockResponse = createMockResponse();
    errorHandler(new BusinessRuleError("Vi phạm QĐ1", "DISTRICT_LIMIT_REACHED"), {}, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(422);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errorCode: "DISTRICT_LIMIT_REACHED",
      message: "Vi phạm QĐ1"
    });
  });

  test("lỗi không lường trước trả 500 và không lộ thông tin nội bộ", () => {
    const mockResponse = createMockResponse();
    errorHandler(new Error("ECONNREFUSED 127.0.0.1:3306"), {}, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errorCode: "INTERNAL_ERROR",
      message: INTERNAL_ERROR_MESSAGE
    });
  });

  test("body quá lớn trả về 413", () => {
    const mockResponse = createMockResponse();
    errorHandler({ type: "entity.too.large" }, {}, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(413);
  });
});
