/**
 * Module xử lý nghiệp vụ Quản lý Đại lý (Lab 09)
 */

// 1. Tính toán chiết khấu doanh số theo cấp đại lý
function calculateDiscount(monthlyRevenue, agencyType) {
  if (
    typeof monthlyRevenue !== "number" ||
    !Number.isFinite(monthlyRevenue) ||
    monthlyRevenue < 0 ||
    !["LOAI_1", "LOAI_2"].includes(agencyType)
  ) {
    throw new Error("Dữ liệu chiết khấu không hợp lệ");
  }

  let rate = 0;
  if (agencyType === "LOAI_1") {
    if (monthlyRevenue >= 100000000) rate = 0.05;
    else if (monthlyRevenue >= 50000000) rate = 0.03;
    else rate = 0.01;
  } else if (agencyType === "LOAI_2") {
    if (monthlyRevenue >= 100000000) rate = 0.03;
    else if (monthlyRevenue >= 50000000) rate = 0.015;
    else rate = 0;
  }

  return monthlyRevenue * rate;
}

// 2. Thẩm định điều kiện xuất hàng vượt trần công nợ (QĐ2 & QĐ4)
function canApproveOrder(currentDebt, orderTotal, debtLimit) {
  if (
    typeof currentDebt !== "number" ||
    typeof orderTotal !== "number" ||
    typeof debtLimit !== "number" ||
    !Number.isFinite(currentDebt) ||
    !Number.isFinite(orderTotal) ||
    !Number.isFinite(debtLimit) ||
    currentDebt < 0 ||
    orderTotal <= 0 ||
    debtLimit <= 0
  ) {
    throw new Error("Dữ liệu thẩm định công nợ không hợp lệ");
  }

  const newDebt = currentDebt + orderTotal;
  if (newDebt <= debtLimit) {
    return {
      approved: true,
      newDebt: newDebt,
      message: "Phê duyệt xuất hàng"
    };
  } else {
    return {
      approved: false,
      newDebt: newDebt,
      reason: "Vượt trần nợ tối đa quy định"
    };
  }
}

// 3. Xác thực định dạng hồ sơ tiếp nhận đại lý (BM1)
function validateAgencyData(agencyData) {
  if (!agencyData || typeof agencyData !== "object") {
    throw new Error("Thông tin hồ sơ đại lý không hợp lệ");
  }

  const { agencyName, agencyType, phone, address, district, email } = agencyData;

  const PHONE_REGEX = /^0\d{9}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isValidName =
    typeof agencyName === "string" &&
    agencyName.trim().length >= 3 &&
    agencyName.trim().length <= 100;

  const isValidType = ["LOAI_1", "LOAI_2"].includes(agencyType);

  const isValidPhone = typeof phone === "string" && PHONE_REGEX.test(phone);

  const isValidAddress =
    typeof address === "string" &&
    address.trim().length >= 5 &&
    address.trim().length <= 255;

  const isValidDistrict =
    typeof district === "string" && district.trim().length > 0;

  const isValidEmail =
    !email || (typeof email === "string" && EMAIL_REGEX.test(email));

  if (
    !isValidName ||
    !isValidType ||
    !isValidPhone ||
    !isValidAddress ||
    !isValidDistrict ||
    !isValidEmail
  ) {
    throw new Error("Thông tin hồ sơ đại lý không hợp lệ");
  }

  return {
    valid: true,
    normalizedData: {
      agencyName: agencyName.trim(),
      agencyType,
      phone: phone.trim(),
      address: address.trim(),
      district: district.trim(),
      email: email ? email.trim() : null
    }
  };
}

module.exports = {
  calculateDiscount,
  canApproveOrder,
  validateAgencyData
};