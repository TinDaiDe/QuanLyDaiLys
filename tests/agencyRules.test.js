const {
  calculateDiscount,
  canApproveOrder,
  validateAgencyData
} = require("../services/agencyRules");

/* ===================== 1. calculateDiscount ===================== */
describe("calculateDiscount - chiết khấu theo doanh số và loại đại lý", () => {
  test("DC01: LOAI_1, doanh số 120 triệu -> chiết khấu 5% = 6.000.000", () => {
    expect(calculateDiscount(120000000, "LOAI_1")).toBe(6000000);
  });

  test("DC02: LOAI_1, doanh số đúng 100 triệu (biên) -> 5% = 5.000.000", () => {
    expect(calculateDiscount(100000000, "LOAI_1")).toBe(5000000);
  });

  test("DC03: LOAI_1, doanh số 99.999.999 -> 3%, làm tròn đến đồng = 3.000.000", () => {
    expect(calculateDiscount(99999999, "LOAI_1")).toBe(3000000);
  });

  test("DC04: LOAI_1, doanh số đúng 50 triệu (biên) -> 3% = 1.500.000", () => {
    expect(calculateDiscount(50000000, "LOAI_1")).toBe(1500000);
  });

  test("DC05: LOAI_1, doanh số 10 triệu -> 1% = 100.000", () => {
    expect(calculateDiscount(10000000, "LOAI_1")).toBe(100000);
  });

  test("DC06: LOAI_2, doanh số 100 triệu (biên) -> 3% = 3.000.000", () => {
    expect(calculateDiscount(100000000, "LOAI_2")).toBe(3000000);
  });

  test("DC07: LOAI_2, doanh số 50 triệu (biên) -> 1,5% = 750.000", () => {
    expect(calculateDiscount(50000000, "LOAI_2")).toBe(750000);
  });

  test("DC08: LOAI_2, doanh số 49.999.999 -> không có chiết khấu", () => {
    expect(calculateDiscount(49999999, "LOAI_2")).toBe(0);
  });

  test("DC09: doanh số bằng 0 -> chiết khấu 0", () => {
    expect(calculateDiscount(0, "LOAI_1")).toBe(0);
  });

  test.each([
    ["DC10: doanh số âm", -1, "LOAI_1"],
    ["DC11: doanh số là chuỗi", "abc", "LOAI_1"],
    ["DC12: doanh số NaN", NaN, "LOAI_1"],
    ["DC13: doanh số Infinity", Infinity, "LOAI_2"],
    ["DC14: loại đại lý không tồn tại", 50000000, "LOAI_3"]
  ])("%s -> báo lỗi", (caseName, revenue, agencyType) => {
    expect(() => calculateDiscount(revenue, agencyType)).toThrow("Dữ liệu chiết khấu không hợp lệ");
  });
});

/* ===================== 2. canApproveOrder ===================== */
describe("canApproveOrder - kiểm tra hạn mức công nợ khi xuất hàng (QĐ2)", () => {
  const DEBT_LIMIT_TYPE_1 = 2000000;

  test("AO01: nợ 0 + phiếu 500.000 <= 2.000.000 -> duyệt", () => {
    const result = canApproveOrder(0, 500000, DEBT_LIMIT_TYPE_1);
    expect(result.approved).toBe(true);
    expect(result.newDebt).toBe(500000);
  });

  test("AO02: nợ mới đúng bằng hạn mức (biên) -> duyệt", () => {
    const result = canApproveOrder(1500000, 500000, DEBT_LIMIT_TYPE_1);
    expect(result.approved).toBe(true);
    expect(result.newDebt).toBe(2000000);
  });

  test("AO03: nợ mới vượt hạn mức 1 đồng (biên) -> từ chối", () => {
    const result = canApproveOrder(1500000, 500001, DEBT_LIMIT_TYPE_1);
    expect(result.approved).toBe(false);
    expect(result.reason).toBe("Vượt trần nợ tối đa quy định");
  });

  test("AO04: đại lý loại 2 (hạn mức 1.000.000), nợ 800.000 + phiếu 300.000 -> từ chối", () => {
    expect(canApproveOrder(800000, 300000, 1000000).approved).toBe(false);
  });

  test("AO05: nợ hiện tại đã vượt hạn mức sau khi đổi quy định -> từ chối", () => {
    expect(canApproveOrder(2100000, 1, DEBT_LIMIT_TYPE_1).approved).toBe(false);
  });

  test.each([
    ["AO06: nợ hiện tại âm", -1, 500000, DEBT_LIMIT_TYPE_1],
    ["AO07: giá trị phiếu bằng 0", 0, 0, DEBT_LIMIT_TYPE_1],
    ["AO08: giá trị phiếu âm", 0, -500000, DEBT_LIMIT_TYPE_1],
    ["AO09: hạn mức bằng 0", 0, 500000, 0],
    ["AO10: nợ hiện tại NaN", NaN, 500000, DEBT_LIMIT_TYPE_1],
    ["AO11: giá trị phiếu là chuỗi", 0, "500000", DEBT_LIMIT_TYPE_1]
  ])("%s -> báo lỗi", (caseName, currentDebt, orderTotal, debtLimit) => {
    expect(() => canApproveOrder(currentDebt, orderTotal, debtLimit)).toThrow(
      "Dữ liệu thẩm định công nợ không hợp lệ"
    );
  });
});

/* ===================== 3. validateAgencyData ===================== */
describe("validateAgencyData - kiểm tra hồ sơ tiếp nhận đại lý (BM1)", () => {
  const VALID_AGENCY = Object.freeze({
    agencyName: "Đại lý Minh Phát",
    agencyType: "LOAI_1",
    phone: "0903112233",
    address: "48 Lê Lợi, Quận 1",
    district: "Quận 1",
    email: "minhphat@gmail.com"
  });
  const INVALID_MESSAGE = "Thông tin hồ sơ đại lý không hợp lệ";

  test("AG01: hồ sơ hợp lệ -> valid và dữ liệu được chuẩn hóa", () => {
    const result = validateAgencyData({ ...VALID_AGENCY, agencyName: "  Đại lý Minh Phát  " });
    expect(result.valid).toBe(true);
    expect(result.normalizedData.agencyName).toBe("Đại lý Minh Phát");
  });

  test("AG02: tên đúng 3 ký tự (biên dưới) -> hợp lệ", () => {
    expect(validateAgencyData({ ...VALID_AGENCY, agencyName: "ABC" }).valid).toBe(true);
  });

  test("AG03: không nhập email -> hợp lệ, email = null", () => {
    const { email, ...agencyWithoutEmail } = VALID_AGENCY;
    expect(email).toBeDefined();
    expect(validateAgencyData(agencyWithoutEmail).normalizedData.email).toBeNull();
  });

  test.each([
    ["AG04: tên chỉ 2 ký tự", { agencyName: "AB" }],
    ["AG05: tên dài 101 ký tự", { agencyName: "A".repeat(101) }],
    ["AG06: loại đại lý không tồn tại", { agencyType: "LOAI_3" }],
    ["AG07: điện thoại 9 chữ số", { phone: "090311223" }],
    ["AG08: điện thoại không bắt đầu bằng 0", { phone: "1903112233" }],
    ["AG09: địa chỉ quá ngắn", { address: "Q1" }],
    ["AG10: quận để trống", { district: "   " }],
    ["AG11: email sai định dạng", { email: "minhphat.gmail.com" }],
    ["AG12: tên chứa thẻ script (XSS)", { agencyName: "<script>alert(1)</script>" }]
  ])("%s -> báo lỗi", (caseName, invalidField) => {
    expect(() => validateAgencyData({ ...VALID_AGENCY, ...invalidField })).toThrow(INVALID_MESSAGE);
  });

  test("AG13: dữ liệu null -> báo lỗi", () => {
    expect(() => validateAgencyData(null)).toThrow(INVALID_MESSAGE);
  });
});
