/**
 * PHIÊN BẢN THAM KHẢO dùng MySQL (thư viện mysql2/promise).
 * Chưa được nạp trong app.js; minh họa cách chống SQL Injection khi nhóm
 * chuyển từ bộ nhớ sang cơ sở dữ liệu thật.
 *
 * Nguyên tắc:
 *  1. Luôn dùng truy vấn có tham số (dấu ?) với pool.execute(), KHÔNG nối chuỗi.
 *  2. Tên cột dùng trong ORDER BY / WHERE động phải lấy từ danh sách cho phép.
 *  3. Tài khoản kết nối CSDL chỉ có quyền tối thiểu (SELECT/INSERT/UPDATE).
 *
 * Cài đặt khi cần: npm install mysql2
 */

const { AGENCY_STATUS } = require("../../config/constants");

/** Các cột được phép sắp xếp - không bao giờ đưa trực tiếp input vào ORDER BY. */
const SORTABLE_COLUMNS = Object.freeze({
  name: "ten_dai_ly",
  receivedDate: "ngay_tiep_nhan",
  debt: "tien_no"
});

/**
 * @param {import("mysql2/promise").Pool} pool
 */
function createMysqlAgencyRepository(pool) {
  async function countActiveByDistrict(district, excludedAgencyId = 0) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) AS total FROM dai_ly WHERE ma_quan = ? AND trang_thai = ? AND ma_dai_ly <> ?",
      [district, AGENCY_STATUS.ACTIVE, excludedAgencyId]
    );
    return rows[0].total;
  }

  async function search({ keyword, district, agencyType, sortBy = "name" } = {}) {
    const conditions = [];
    const parameters = [];

    if (keyword) {
      conditions.push("(ten_dai_ly LIKE ? OR dien_thoai LIKE ?)");
      parameters.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (district !== undefined) {
      conditions.push("ma_quan = ?");
      parameters.push(district);
    }
    if (agencyType !== undefined) {
      conditions.push("ma_loai_dai_ly = ?");
      parameters.push(agencyType);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderColumn = SORTABLE_COLUMNS[sortBy] || SORTABLE_COLUMNS.name;

    const [rows] = await pool.execute(
      `SELECT * FROM dai_ly ${whereClause} ORDER BY ${orderColumn}`,
      parameters
    );
    return rows;
  }

  return { countActiveByDistrict, search };
}

/*
 * CÁCH VIẾT SAI - DỄ BỊ SQL INJECTION (không dùng):
 *
 *   const sql = "SELECT * FROM dai_ly WHERE ten_dai_ly = '" + keyword + "'";
 *
 * Nếu keyword = "' OR '1'='1", câu lệnh trả về toàn bộ bảng.
 */

module.exports = { createMysqlAgencyRepository, SORTABLE_COLUMNS };
