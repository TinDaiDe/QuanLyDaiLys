# Hướng dẫn sử dụng Git

Tài liệu tóm tắt các lệnh Git thường dùng khi làm việc nhóm trên GitHub.

---

## 1. Cài đặt và cấu hình lần đầu

Tải Git tại: https://git-scm.com/downloads

Khai báo tên và email (chỉ làm **một lần** trên mỗi máy):

```bash
git config --global user.name "Ho Ten Cua Ban"
git config --global user.email "email@example.com"
git config --global init.defaultBranch main
```

Kiểm tra lại cấu hình:

```bash
git config --list
```

> Email nên trùng với email tài khoản GitHub để commit hiện đúng tên của bạn.

---

## 2. Khái niệm cơ bản

| Khái niệm | Ý nghĩa |
|---|---|
| **Repository (repo)** | Thư mục dự án được Git theo dõi |
| **Working directory** | Các file bạn đang sửa trên máy |
| **Staging area** | Nơi "chuẩn bị" các thay đổi trước khi commit (`git add`) |
| **Commit** | Một lần lưu lại trạng thái code, kèm thông điệp mô tả |
| **Branch (nhánh)** | Một hướng phát triển riêng, không ảnh hưởng nhánh khác |
| **Remote (origin)** | Repo trên GitHub |
| **Pull Request (PR)** | Yêu cầu gộp code từ nhánh của bạn vào nhánh chính, để nhóm review |

Luồng cơ bản:

```
Sửa file  →  git add  →  git commit  →  git push  →  GitHub
                                          ↑
                         git pull  ←──────┘ (lấy code người khác)
```

---

## 3. Bắt đầu với một repo

**Tạo repo mới từ thư mục có sẵn:**

```bash
cd ten-thu-muc
git init
git add .
git commit -m "Khởi tạo dự án"
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

**Tải repo có sẵn từ GitHub về máy:**

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>
```

---

## 4. Lưu thay đổi (commit)

```bash
git status                  # xem file nào đã thay đổi
git diff                    # xem chi tiết nội dung thay đổi
git add ten-file            # đưa 1 file vào staging
git add .                   # đưa tất cả thay đổi vào staging
git commit -m "Mô tả ngắn gọn thay đổi"
```

**Cách viết thông điệp commit tốt:**

- Ngắn gọn, nói rõ *làm gì*: `Thêm màn hình lập phiếu thu`
- Có thể dùng tiền tố: `feat:` (tính năng), `fix:` (sửa lỗi), `docs:` (tài liệu), `refactor:` (tái cấu trúc)
- Tránh: `update`, `sửa`, `abc`, `final final 2`

---

## 5. Làm việc với nhánh (branch)

```bash
git branch                       # liệt kê nhánh trên máy (* là nhánh hiện tại)
git branch -a                    # liệt kê cả nhánh trên remote
git switch -c ten-nhanh          # tạo nhánh mới và chuyển sang
git switch ten-nhanh             # chuyển sang nhánh đã có
git branch -d ten-nhanh          # xóa nhánh (đã merge)
```

> Bản Git cũ dùng `git checkout -b ten-nhanh` thay cho `git switch -c ten-nhanh`.

**Quy ước đặt tên nhánh:** chữ thường, không dấu, nối bằng `-`, có tiền tố:

- `feature/them-dai-ly`
- `fix/loi-tinh-cong-no`
- `docs/bao-cao-tuan-6`

---

## 6. Đồng bộ với GitHub

```bash
git pull                              # lấy code mới nhất về nhánh hiện tại
git push                              # đẩy commit lên GitHub
git push -u origin ten-nhanh          # đẩy nhánh mới lên lần đầu
git fetch                             # tải thông tin mới, chưa gộp vào code
```

---

## 7. Quy trình làm việc nhóm (khuyến nghị)

```bash
# 1. Cập nhật nhánh chính
git switch main
git pull

# 2. Tạo nhánh riêng cho công việc của mình
git switch -c feature/lap-phieu-thu

# 3. Code, rồi commit thường xuyên
git add .
git commit -m "feat: thêm form lập phiếu thu"

# 4. Đẩy nhánh lên GitHub
git push -u origin feature/lap-phieu-thu
```

5. Lên GitHub → **Compare & pull request** → mô tả thay đổi → gửi cho nhóm review.
6. Sau khi được duyệt → **Merge** vào `main`.
7. Về máy cập nhật lại và xóa nhánh cũ:

```bash
git switch main
git pull
git branch -d feature/lap-phieu-thu
```

**Nguyên tắc:**

- Không code trực tiếp trên `main`.
- `git pull` trước khi bắt đầu làm mỗi ngày.
- Mỗi nhánh chỉ làm **một** việc.
- Commit nhỏ, thường xuyên; không gom cả tuần vào một commit.

---

## 8. Gộp nhánh và xử lý xung đột (conflict)

Gộp nhánh `main` mới nhất vào nhánh của bạn:

```bash
git switch feature/lap-phieu-thu
git merge main
```

Nếu có xung đột, Git đánh dấu trong file như sau:

```
<<<<<<< HEAD
code của bạn
=======
code từ main
>>>>>>> main
```

Cách xử lý:

1. Mở file, giữ lại đoạn code đúng (hoặc kết hợp cả hai), **xóa các dòng** `<<<<<<<`, `=======`, `>>>>>>>`.
2. Lưu file, rồi:

```bash
git add ten-file
git commit -m "Giải quyết xung đột với main"
```

> VS Code có sẵn nút **Accept Current / Accept Incoming / Accept Both** giúp xử lý xung đột dễ hơn.

---

## 9. Xem lịch sử

```bash
git log                       # lịch sử commit đầy đủ
git log --oneline             # mỗi commit một dòng
git log --oneline --graph --all   # xem dạng cây các nhánh
git show <ma-commit>          # xem chi tiết một commit
```

---

## 10. Hoàn tác (undo)

| Tình huống | Lệnh |
|---|---|
| Hủy thay đổi chưa `add` của một file | `git restore ten-file` |
| Bỏ một file ra khỏi staging (đã `add`) | `git restore --staged ten-file` |
| Sửa thông điệp commit gần nhất (chưa push) | `git commit --amend -m "Thông điệp mới"` |
| Hủy commit gần nhất, **giữ** thay đổi | `git reset --soft HEAD~1` |
| Đảo ngược một commit **đã push** (an toàn) | `git revert <ma-commit>` |
| Tạm cất thay đổi để chuyển nhánh | `git stash` → sau đó `git stash pop` |

> ⚠️ Tránh `git reset --hard` và `git push --force` trên nhánh dùng chung — có thể làm mất code của người khác.

---

## 11. File `.gitignore`

Tạo file `.gitignore` ở thư mục gốc để Git bỏ qua các file không cần đưa lên:

```gitignore
# Thư viện, file build
node_modules/
__pycache__/
dist/
build/

# Biến môi trường, mật khẩu
.env

# File hệ thống / IDE
.DS_Store
Thumbs.db
.vscode/
.idea/

# File tạm của Word/Office
~$*
```

> Không bao giờ commit mật khẩu, API key, file `.env` lên GitHub.

---

## 12. Bảng lệnh nhanh

| Mục đích | Lệnh |
|---|---|
| Tải repo về | `git clone <url>` |
| Xem trạng thái | `git status` |
| Thêm thay đổi | `git add .` |
| Lưu thay đổi | `git commit -m "..."` |
| Đẩy lên GitHub | `git push` |
| Lấy code mới | `git pull` |
| Tạo + chuyển nhánh | `git switch -c <nhanh>` |
| Chuyển nhánh | `git switch <nhanh>` |
| Gộp nhánh | `git merge <nhanh>` |
| Xem lịch sử | `git log --oneline` |
| Tạm cất thay đổi | `git stash` / `git stash pop` |

---

## 13. Lỗi thường gặp

**`rejected ... (fetch first)` khi push**
→ Trên GitHub có commit mới mà máy bạn chưa có. Chạy `git pull` rồi `git push` lại.

**`Your local changes would be overwritten` khi pull hoặc chuyển nhánh**
→ Commit thay đổi trước (`git add . && git commit -m "..."`), hoặc cất tạm bằng `git stash`.

**`fatal: not a git repository`**
→ Bạn đang đứng sai thư mục. Dùng `cd` vào đúng thư mục dự án.

**Đăng nhập GitHub khi push bị từ chối mật khẩu**
→ GitHub không nhận mật khẩu tài khoản qua dòng lệnh nữa. Dùng **Personal Access Token** (Settings → Developer settings → Personal access tokens) thay cho mật khẩu, hoặc đăng nhập qua GitHub Desktop / VS Code.
