/**
 * Nghiệp vụ quản lý đại lý.
 *  - UC01 Tiếp nhận đại lý (BM1, QĐ1)
 *  - UC02 Cập nhật thông tin đại lý
 *  - UC03 Ngừng hoạt động đại lý (chỉ khi đã hết nợ)
 *  - UC12 Tra cứu / tìm kiếm đại lý (BM3)
 */

const agencyRepository = require("../repositories/agencyRepository");
const { AGENCY_RULES, AGENCY_STATUS, TEXT_LIMITS } = require("../config/constants");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  BusinessRuleError
} = require("../errors/AppError");
const {
  ADDRESS_PATTERN,
  PERSON_OR_AGENCY_NAME_PATTERN,
  PHONE_NUMBER_PATTERN,
  normalizeWhitespace,
  parseIntegerInRange,
  parsePastOrTodayDate,
  requireText,
  validateText
} = require("../utils/validators");

const MAX_AGENCY_ID = Number.MAX_SAFE_INTEGER;

/** Định dạng số tiền theo kiểu Việt Nam, ví dụ 1.235.200 đ. */
function formatCurrency(amount) {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

function parseAgencyId(rawAgencyId) {
  return parseIntegerInRange(rawAgencyId, {
    fieldLabel: "Mã đại lý",
    min: 1,
    max: MAX_AGENCY_ID
  });
}

function parseAgencyType(rawAgencyType) {
  const agencyType = parseIntegerInRange(rawAgencyType, {
    fieldLabel: "Loại đại lý",
    min: Math.min(...AGENCY_RULES.AGENCY_TYPES),
    max: Math.max(...AGENCY_RULES.AGENCY_TYPES)
  });
  // Phòng trường hợp danh sách loại không liên tục, ví dụ [1, 3].
  if (!AGENCY_RULES.AGENCY_TYPES.includes(agencyType)) {
    throw new ValidationError(
      `Loại đại lý phải là một trong: ${AGENCY_RULES.AGENCY_TYPES.join(", ")}`
    );
  }
  return agencyType;
}

function parseDistrict(rawDistrict) {
  return parseIntegerInRange(rawDistrict, {
    fieldLabel: "Quận",
    min: 1,
    max: AGENCY_RULES.DISTRICT_COUNT
  });
}

/**
 * Kiểm tra và chuẩn hóa dữ liệu hồ sơ đại lý theo biểu mẫu BM1.
 * @returns {{agencyName: string, agencyType: number, phoneNumber: string,
 *            address: string, district: number, receivedDate: string}}
 */
function validateAgencyProfile(input = {}) {
  const agencyName = validateText(requireText(input.agencyName, "Tên đại lý"), {
    fieldLabel: "Tên đại lý",
    maxLength: TEXT_LIMITS.AGENCY_NAME_MAX,
    pattern: PERSON_OR_AGENCY_NAME_PATTERN
  });

  const phoneNumber = requireText(input.phoneNumber, "Điện thoại").replace(/[\s.]/g, "");
  if (!PHONE_NUMBER_PATTERN.test(phoneNumber)) {
    throw new ValidationError("Điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
  }

  const address = validateText(requireText(input.address, "Địa chỉ"), {
    fieldLabel: "Địa chỉ",
    maxLength: TEXT_LIMITS.ADDRESS_MAX,
    pattern: ADDRESS_PATTERN
  });

  return {
    agencyName,
    agencyType: parseAgencyType(input.agencyType),
    phoneNumber,
    address,
    district: parseDistrict(input.district),
    receivedDate: parsePastOrTodayDate(input.receivedDate, "Ngày tiếp nhận")
  };
}

/**
 * QĐ1: mỗi quận có tối đa MAX_AGENCIES_PER_DISTRICT đại lý đang hoạt động.
 * @throws {BusinessRuleError}
 */
async function ensureDistrictHasCapacity(district, excludedAgencyId) {
  const activeCount = await agencyRepository.countActiveByDistrict(district, excludedAgencyId);
  if (activeCount >= AGENCY_RULES.MAX_AGENCIES_PER_DISTRICT) {
    throw new BusinessRuleError(
      "Quận này đã đạt số lượng đại lý tối đa cho phép",
      "DISTRICT_LIMIT_REACHED"
    );
  }
}

async function findExistingAgency(agencyId) {
  const agency = await agencyRepository.findById(agencyId);
  if (!agency) {
    throw new NotFoundError("Không tìm thấy đại lý");
  }
  return agency;
}

/** UC01 - Tiếp nhận đại lý mới, công nợ ban đầu bằng 0. */
async function receiveAgency(input) {
  const agencyProfile = validateAgencyProfile(input);
  await ensureDistrictHasCapacity(agencyProfile.district);
  return agencyRepository.create({
    ...agencyProfile,
    debt: 0,
    status: AGENCY_STATUS.ACTIVE
  });
}

/** UC12 - Xem chi tiết một đại lý. */
async function getAgencyById(rawAgencyId) {
  return findExistingAgency(parseAgencyId(rawAgencyId));
}

/** UC12 - Tra cứu theo từ khóa (tên, mã, điện thoại), quận và loại đại lý. */
async function searchAgencies(query = {}) {
  const criteria = {};

  if (typeof query.keyword === "string" && query.keyword.trim() !== "") {
    const keyword = normalizeWhitespace(query.keyword);
    if (keyword.length > TEXT_LIMITS.SEARCH_KEYWORD_MAX) {
      throw new ValidationError(
        `Từ khóa tìm kiếm không được vượt quá ${TEXT_LIMITS.SEARCH_KEYWORD_MAX} ký tự`
      );
    }
    criteria.keyword = keyword;
  }
  if (query.district !== undefined) {
    criteria.district = parseDistrict(query.district);
  }
  if (query.agencyType !== undefined) {
    criteria.agencyType = parseAgencyType(query.agencyType);
  }

  return agencyRepository.search(criteria);
}

/** UC02 - Cập nhật hồ sơ đại lý; đổi quận thì phải kiểm tra lại QĐ1. */
async function updateAgency(rawAgencyId, input) {
  const agencyId = parseAgencyId(rawAgencyId);
  const currentAgency = await findExistingAgency(agencyId);

  if (currentAgency.status === AGENCY_STATUS.INACTIVE) {
    throw new BusinessRuleError(
      "Không thể cập nhật đại lý đã ngừng hoạt động",
      "AGENCY_INACTIVE"
    );
  }

  const agencyProfile = validateAgencyProfile(input);
  if (agencyProfile.district !== currentAgency.district) {
    await ensureDistrictHasCapacity(agencyProfile.district, agencyId);
  }
  return agencyRepository.update(agencyId, agencyProfile);
}

/** UC03 - Ngừng hoạt động đại lý; chỉ thực hiện được khi tiền nợ bằng 0. */
async function deactivateAgency(rawAgencyId) {
  const agencyId = parseAgencyId(rawAgencyId);
  const agency = await findExistingAgency(agencyId);

  if (agency.status === AGENCY_STATUS.INACTIVE) {
    throw new ConflictError("Đại lý đã ngừng hoạt động trước đó", "AGENCY_ALREADY_INACTIVE");
  }
  if (agency.debt > 0) {
    throw new BusinessRuleError(
      `Đại lý ${agency.agencyName} còn nợ ${formatCurrency(agency.debt)}, ` +
        "chỉ được ngừng hoạt động khi đã hết nợ",
      "AGENCY_HAS_DEBT"
    );
  }
  return agencyRepository.update(agencyId, { status: AGENCY_STATUS.INACTIVE });
}

module.exports = {
  receiveAgency,
  getAgencyById,
  searchAgencies,
  updateAgency,
  deactivateAgency
};
