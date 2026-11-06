/**
 * Nghiệp vụ xác thực: đăng ký và đăng nhập tài khoản người dùng.
 * Tài khoản gắn với một trong 4 vai trò (actor) của hệ thống.
 */

const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { PASSWORD_RULES, TEXT_LIMITS, USER_ROLES } = require("../config/constants");
const { ValidationError, UnauthorizedError } = require("../errors/AppError");
const {
  PERSON_OR_AGENCY_NAME_PATTERN,
  USERNAME_PATTERN,
  requireText,
  validateText
} = require("../utils/validators");

const INVALID_CREDENTIALS_MESSAGE = "Tên đăng nhập hoặc mật khẩu không đúng";
const VALID_ROLES = Object.freeze(Object.values(USER_ROLES));

let dummyPasswordHashPromise = null;

/**
 * Hash giả dùng khi không tìm thấy tài khoản: vẫn chạy bcrypt.compare để thời
 * gian phản hồi tương đương trường hợp sai mật khẩu, tránh kẻ tấn công dò ra
 * tên đăng nhập nào có tồn tại dựa vào tốc độ phản hồi.
 */
function getDummyPasswordHash() {
  if (!dummyPasswordHashPromise) {
    dummyPasswordHashPromise = bcrypt.hash("dummy-password", PASSWORD_RULES.BCRYPT_SALT_ROUNDS);
  }
  return dummyPasswordHashPromise;
}

/** Chỉ trả các trường được phép công khai, không bao giờ trả passwordHash. */
function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role
  };
}

function normalizeUsername(rawUsername) {
  const username = requireText(rawUsername, "Tên đăng nhập").toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    throw new ValidationError(
      "Tên đăng nhập gồm 3–30 ký tự, chỉ dùng chữ thường không dấu, số, dấu chấm hoặc gạch dưới"
    );
  }
  return username;
}

function validatePassword(password) {
  if (typeof password !== "string" || password === "") {
    throw new ValidationError("Mật khẩu là bắt buộc");
  }
  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    throw new ValidationError(`Mật khẩu phải có ít nhất ${PASSWORD_RULES.MIN_LENGTH} ký tự`);
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_RULES.MAX_LENGTH) {
    throw new ValidationError(`Mật khẩu không được dài quá ${PASSWORD_RULES.MAX_LENGTH} byte`);
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new ValidationError("Mật khẩu phải chứa cả chữ cái và chữ số");
  }
}

function validateRole(role) {
  if (!VALID_ROLES.includes(role)) {
    throw new ValidationError(`Vai trò phải là một trong: ${VALID_ROLES.join(", ")}`);
  }
  return role;
}

/**
 * Đăng ký tài khoản mới.
 * @param {{username: string, password: string, fullName: string, role: string}} input
 * @returns {Promise<{id: number, username: string, fullName: string, role: string}>}
 * @throws {ValidationError|ConflictError}
 */
async function register({ username, password, fullName, role } = {}) {
  const normalizedUsername = normalizeUsername(username);
  validatePassword(password);
  const normalizedFullName = validateText(requireText(fullName, "Họ tên"), {
    fieldLabel: "Họ tên",
    maxLength: TEXT_LIMITS.FULL_NAME_MAX,
    pattern: PERSON_OR_AGENCY_NAME_PATTERN
  });
  const validRole = validateRole(role);

  const passwordHash = await bcrypt.hash(password, PASSWORD_RULES.BCRYPT_SALT_ROUNDS);
  const createdUser = await userRepository.create({
    username: normalizedUsername,
    passwordHash,
    fullName: normalizedFullName,
    role: validRole
  });
  return toPublicUser(createdUser);
}

/**
 * Đăng nhập. Dùng chung một thông báo lỗi cho cả trường hợp sai tên đăng nhập
 * và sai mật khẩu để không tiết lộ tài khoản nào đang tồn tại.
 * @param {{username: string, password: string}} input
 * @throws {ValidationError|UnauthorizedError}
 */
async function login({ username, password } = {}) {
  const isMissingInput =
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim() === "" ||
    password === "";
  if (isMissingInput) {
    throw new ValidationError("Tên đăng nhập và mật khẩu là bắt buộc");
  }

  const user = await userRepository.findByUsername(username.trim().toLowerCase());
  const passwordHashToCompare = user ? user.passwordHash : await getDummyPasswordHash();
  const isPasswordCorrect = await bcrypt.compare(password, passwordHashToCompare);

  if (!user || !isPasswordCorrect) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }
  return toPublicUser(user);
}

module.exports = { register, login, INVALID_CREDENTIALS_MESSAGE };
