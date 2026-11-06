/**
 * Điểm khởi chạy máy chủ: npm start
 */

const app = require("./app");

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT) || DEFAULT_PORT;

app.listen(port, () => {
  console.log(`Máy chủ Quản lý đại lý đang chạy tại http://localhost:${port}`);
});
