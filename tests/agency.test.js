/**
 * Kiểm thử API Quản lý đại lý: UC01, UC02, UC03, UC12 và quy định QĐ1.
 */

const request = require("supertest");
const app = require("../app");
const agencyRepository = require("../repositories/agencyRepository");
const { AGENCY_RULES, AGENCY_STATUS } = require("../config/constants");

const VALID_AGENCY = Object.freeze({
  agencyName: "Đại lý Minh Phát",
  agencyType: 1,
  phoneNumber: "0903112233",
  address: "48 Lê Lợi, Phường Bến Nghé",
  district: 1,
  receivedDate: "2026-10-15"
});

function receiveAgency(overrides = {}) {
  return request(app)
    .post("/api/agencies")
    .send({ ...VALID_AGENCY, ...overrides });
}

/** Tiếp nhận đủ số đại lý tối đa cho một quận theo QĐ1. */
async function fillDistrict(district) {
  for (let index = 1; index <= AGENCY_RULES.MAX_AGENCIES_PER_DISTRICT; index++) {
    await receiveAgency({ agencyName: `Đại lý Quận ${district} số ${index}`, district });
  }
}

beforeEach(() => {
  agencyRepository.clear();
});

describe("POST /api/agencies - Tiếp nhận đại lý (UC01)", () => {
  test("tiếp nhận thành công, sinh mã DL001 và công nợ ban đầu bằng 0", async () => {
    const response = await receiveAgency();

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      code: "DL001",
      agencyName: VALID_AGENCY.agencyName,
      debt: 0,
      status: AGENCY_STATUS.ACTIVE
    });
  });

  test("chuẩn hóa số điện thoại có dấu cách hoặc dấu chấm", async () => {
    const response = await receiveAgency({ phoneNumber: "0903 112.233" });

    expect(response.status).toBe(201);
    expect(response.body.data.phoneNumber).toBe("0903112233");
  });

  test("QĐ1: từ chối khi quận đã đủ số đại lý tối đa (422)", async () => {
    await fillDistrict(3);
    const response = await receiveAgency({ district: 3 });

    expect(response.status).toBe(422);
    expect(response.body.errorCode).toBe("DISTRICT_LIMIT_REACHED");
    expect(response.body.message).toBe("Quận này đã đạt số lượng đại lý tối đa cho phép");
  });

  test("QĐ1: đại lý đã ngừng hoạt động không tính vào giới hạn của quận", async () => {
    await fillDistrict(5);
    await agencyRepository.update(1, { status: AGENCY_STATUS.INACTIVE });

    const response = await receiveAgency({ district: 5 });

    expect(response.status).toBe(201);
  });

  test.each([
    ["thiếu tên đại lý", { agencyName: undefined }],
    ["tên đại lý chứa thẻ script (XSS)", { agencyName: "<img src=x onerror=alert(1)>" }],
    ["điện thoại sai định dạng", { phoneNumber: "090345" }],
    ["loại đại lý không tồn tại", { agencyType: 3 }],
    ["loại đại lý không phải số", { agencyType: "abc" }],
    ["quận nằm ngoài 1–20", { district: 21 }],
    ["ngày tiếp nhận sai định dạng", { receivedDate: "15/10/2026" }],
    ["ngày tiếp nhận không có thật", { receivedDate: "2026-02-30" }],
    ["ngày tiếp nhận ở tương lai", { receivedDate: "2999-01-01" }],
    ["địa chỉ quá dài", { address: "a".repeat(201) }]
  ])("từ chối dữ liệu không hợp lệ: %s (400)", async (caseName, invalidField) => {
    const response = await receiveAgency(invalidField);

    expect(response.status).toBe(400);
    expect(response.body.errorCode).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/agencies - Tra cứu đại lý (UC12)", () => {
  beforeEach(async () => {
    await receiveAgency();
    await receiveAgency({
      agencyName: "Đại lý Hoàng Long",
      agencyType: 2,
      phoneNumber: "0912445667",
      district: 3
    });
  });

  test("trả về toàn bộ danh sách khi không có điều kiện lọc", async () => {
    const response = await request(app).get("/api/agencies");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
  });

  test("lọc theo từ khóa không phân biệt hoa thường", async () => {
    const response = await request(app).get("/api/agencies").query({ keyword: "hoàng LONG" });

    expect(response.body.total).toBe(1);
    expect(response.body.data[0].agencyName).toBe("Đại lý Hoàng Long");
  });

  test("lọc kết hợp quận và loại đại lý", async () => {
    const response = await request(app)
      .get("/api/agencies")
      .query({ district: "1", agencyType: "1" });

    expect(response.body.total).toBe(1);
    expect(response.body.data[0].code).toBe("DL001");
  });

  test("từ khóa chứa cú pháp SQL được coi là chuỗi thường, không trả về toàn bộ dữ liệu", async () => {
    const response = await request(app).get("/api/agencies").query({ keyword: "' OR '1'='1" });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
  });

  test("từ chối từ khóa quá dài và bộ lọc quận không hợp lệ (400)", async () => {
    const longKeywordResponse = await request(app)
      .get("/api/agencies")
      .query({ keyword: "x".repeat(51) });
    const invalidDistrictResponse = await request(app)
      .get("/api/agencies")
      .query({ district: "abc" });

    expect(longKeywordResponse.status).toBe(400);
    expect(invalidDistrictResponse.status).toBe(400);
  });

  test("xem chi tiết đại lý theo mã", async () => {
    const response = await request(app).get("/api/agencies/2");

    expect(response.status).toBe(200);
    expect(response.body.data.code).toBe("DL002");
  });

  test("trả về 404 khi không tìm thấy và 400 khi mã không phải số", async () => {
    const notFoundResponse = await request(app).get("/api/agencies/999");
    const invalidIdResponse = await request(app).get("/api/agencies/abc");

    expect(notFoundResponse.status).toBe(404);
    expect(invalidIdResponse.status).toBe(400);
  });
});

describe("PUT /api/agencies/:agencyId - Cập nhật đại lý (UC02)", () => {
  beforeEach(async () => {
    await receiveAgency();
  });

  test("cập nhật thành công và giữ nguyên mã đại lý", async () => {
    const response = await request(app)
      .put("/api/agencies/1")
      .send({ ...VALID_AGENCY, address: "125 Nguyễn Đình Chiểu, Phường 6" });

    expect(response.status).toBe(200);
    expect(response.body.data.address).toBe("125 Nguyễn Đình Chiểu, Phường 6");
    expect(response.body.data.code).toBe("DL001");
  });

  test("QĐ1: chuyển sang quận đã đủ đại lý bị từ chối (422)", async () => {
    await fillDistrict(7);
    const response = await request(app)
      .put("/api/agencies/1")
      .send({ ...VALID_AGENCY, district: 7 });

    expect(response.status).toBe(422);
    expect(response.body.errorCode).toBe("DISTRICT_LIMIT_REACHED");
  });

  test("không cho cập nhật đại lý đã ngừng hoạt động (422)", async () => {
    await agencyRepository.update(1, { status: AGENCY_STATUS.INACTIVE });
    const response = await request(app).put("/api/agencies/1").send(VALID_AGENCY);

    expect(response.status).toBe(422);
    expect(response.body.errorCode).toBe("AGENCY_INACTIVE");
  });

  test("trả về 404 khi cập nhật đại lý không tồn tại", async () => {
    const response = await request(app).put("/api/agencies/999").send(VALID_AGENCY);

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/agencies/:agencyId/deactivate - Ngừng hoạt động (UC03)", () => {
  beforeEach(async () => {
    await receiveAgency();
  });

  test("ngừng hoạt động thành công khi đại lý đã hết nợ", async () => {
    const response = await request(app).patch("/api/agencies/1/deactivate");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(AGENCY_STATUS.INACTIVE);
  });

  test("từ chối khi đại lý còn nợ và nêu rõ số tiền (422)", async () => {
    await agencyRepository.update(1, { debt: 1235200 });
    const response = await request(app).patch("/api/agencies/1/deactivate");

    expect(response.status).toBe(422);
    expect(response.body.errorCode).toBe("AGENCY_HAS_DEBT");
    expect(response.body.message).toContain("1.235.200 đ");
  });

  test("từ chối khi đại lý đã ngừng hoạt động trước đó (409)", async () => {
    await request(app).patch("/api/agencies/1/deactivate");
    const response = await request(app).patch("/api/agencies/1/deactivate");

    expect(response.status).toBe(409);
  });
});
