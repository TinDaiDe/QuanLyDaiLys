/**
 * Kho lưu trữ đại lý (lưu trong bộ nhớ, dùng cho bài thực hành).
 *
 * Mọi hàm đều là async để giao diện giống hệt phiên bản dùng cơ sở dữ liệu;
 * tầng service không cần sửa khi đổi sang MySQL.
 */

const { AGENCY_STATUS } = require("../config/constants");

const agenciesById = new Map();
let nextAgencyId = 1;

function cloneAgency(agency) {
  return agency ? { ...agency } : null;
}

/** Sinh mã đại lý dạng DL001, DL002, ... */
function buildAgencyCode(agencyId) {
  return `DL${String(agencyId).padStart(3, "0")}`;
}

async function create(agencyData) {
  const agencyId = nextAgencyId++;
  const agency = {
    id: agencyId,
    code: buildAgencyCode(agencyId),
    ...agencyData
  };
  agenciesById.set(agencyId, agency);
  return cloneAgency(agency);
}

async function findById(agencyId) {
  return cloneAgency(agenciesById.get(agencyId));
}

async function update(agencyId, changes) {
  const currentAgency = agenciesById.get(agencyId);
  if (!currentAgency) {
    return null;
  }
  const updatedAgency = { ...currentAgency, ...changes, id: agencyId, code: currentAgency.code };
  agenciesById.set(agencyId, updatedAgency);
  return cloneAgency(updatedAgency);
}

/**
 * Đếm số đại lý đang hoạt động trong một quận (phục vụ kiểm tra QĐ1).
 * @param {number} district
 * @param {number} [excludedAgencyId] Bỏ qua chính đại lý đang cập nhật.
 */
async function countActiveByDistrict(district, excludedAgencyId) {
  let activeCount = 0;
  for (const agency of agenciesById.values()) {
    const isCounted =
      agency.district === district &&
      agency.status === AGENCY_STATUS.ACTIVE &&
      agency.id !== excludedAgencyId;
    if (isCounted) {
      activeCount++;
    }
  }
  return activeCount;
}

/**
 * Tra cứu đại lý theo các tiêu chí tùy chọn (UC12).
 * @param {{keyword?: string, district?: number, agencyType?: number}} criteria
 */
async function search({ keyword, district, agencyType } = {}) {
  const lowerKeyword = keyword ? keyword.toLowerCase() : null;
  const matchedAgencies = [];
  for (const agency of agenciesById.values()) {
    const matchesKeyword =
      !lowerKeyword ||
      agency.agencyName.toLowerCase().includes(lowerKeyword) ||
      agency.code.toLowerCase().includes(lowerKeyword) ||
      agency.phoneNumber.includes(lowerKeyword);
    const matchesDistrict = district === undefined || agency.district === district;
    const matchesType = agencyType === undefined || agency.agencyType === agencyType;
    if (matchesKeyword && matchesDistrict && matchesType) {
      matchedAgencies.push(cloneAgency(agency));
    }
  }
  return matchedAgencies;
}

/** Xóa toàn bộ dữ liệu - chỉ dùng trong kiểm thử. */
function clear() {
  agenciesById.clear();
  nextAgencyId = 1;
}

module.exports = { create, findById, update, countActiveByDistrict, search, clear };
