# 📘 HƯỚNG DẪN DEPLOY FULLSTACK (REACT + FLASK + MYSQL) LÊN AWS EC2 VỚI DOCKER

> Áp dụng cho project **du_an_truong_chung** (Flask backend + React CRA frontend).
> Thay `.pem` path, IP, username cho đúng máy của bạn.

## 0. Tổng quan kiến trúc

```text
Client (browser)
       ↓
http://<EC2_PUBLIC_IP>/             → Nginx (frontend container) → React SPA
http://<EC2_PUBLIC_IP>/api/**       → Nginx (frontend container) → backend:5000/api/**
backend:5000                        → MySQL (host: mysql, port 3306)
```

## 1. Chuẩn bị

- Repo GitHub: `https://github.com/ngan1306/du_an_truong_chung.git`
- AWS account (region: `ap-southeast-1`)

## 2. Tạo EC2 trên AWS

1. **EC2 → Instances → Launch instances**
2. **Tên máy:** `du-an-truong-server`
3. **AMI:** `Ubuntu Server 22.04 LTS (Free tier eligible)`
4. **Instance type:** `t3.micro` (dev) / `t3.small` (khuyến nghị, 2GB RAM)
5. **Key pair:** `du_an_truong` — RSA — `.pem` — tải về (vd: `D:\keys\du_an_truong.pem`)
6. **Security group:**

| Type | Port | Source |
|---|---|---|
| SSH | 22 | My IP |
| HTTP | 80 | Anywhere |
| MySQL/Aurora | 3306 | My IP (khuyên dùng; `Anywhere` chỉ để demo) |

7. **Storage:** 16 GB gp3
8. **Launch** → lấy **Public IPv4** (vd `<EC2_IP>`)

## 3. SSH từ Windows với `.pem`

```powershell
icacls "D:\keys\du_an_truong.pem" /reset
icacls "D:\keys\du_an_truong.pem" /inheritance:r
icacls "D:\keys\du_an_truong.pem" /remove "NT AUTHORITY\Authenticated Users"
icacls "D:\keys\du_an_truong.pem" /remove "BUILTIN\Administrators"
icacls "D:\keys\du_an_truong.pem" /remove "BUILTIN\Users"
icacls "D:\keys\du_an_truong.pem" /remove "NT AUTHORITY\SYSTEM"
icacls "D:\keys\du_an_truong.pem" /grant:r "$($env:USERNAME):(R)"

ssh -i "D:\keys\du_an_truong.pem" ubuntu@<EC2_IP>
```

## 4. Cài Docker + Docker Compose trên EC2

```bash
# (có sẵn script trong repo: scripts/install-docker.sh)
curl -fsSL https://raw.githubusercontent.com/ngan1306/du_an_truong_chung/main/scripts/install-docker.sh -o install-docker.sh
chmod +x install-docker.sh
./install-docker.sh

docker --version
docker compose version
```

## 5. Clone project về EC2

```bash
cd /home/ubuntu
mkdir du_an_truong && cd du_an_truong
git clone https://github.com/ngan1306/du_an_truong_chung.git
cd du_an_truong_chung
```

## 6. Dockerfile (đã có sẵn trong repo)

| File | Nội dung |
|---|---|
| `backend/Dockerfile` | `python:3.13-slim` → pip install → Flask app, EXPOSE 5000 |
| `frontend/Dockerfile` | Multi-stage: `node:20-alpine` build CRA → `nginx:alpine` serve, EXPOSE 80 |

> 🔶 **ENV cho CRA (React Create React App):** CRA **chỉ đọc ENV lúc BUILD**, không đọc lúc runtime.
> → Trong `frontend/Dockerfile` dùng `ARG REACT_APP_API_URL` + `ENV REACT_APP_API_URL=$REACT_APP_API_URL`,
> và trong `docker-compose.aws.yml` truyền qua `build.args`.
> Nếu đổi ENV sau khi build → **phải build lại image**.

## 7. Nginx reverse proxy (frontend → backend)

`frontend/nginx.conf` (đã cập nhật trong repo):

```nginx
location /api/ {
    proxy_pass http://backend:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

→ Frontend gọi `REACT_APP_API_URL=/api` (relative) → cùng origin với Nginx → proxy qua backend, **không gặp CORS**.

## 8. docker-compose.aws.yml (orchestrate toàn stack)

File: `docker-compose.aws.yml` trong repo — gồm 3 service:

- `mysql` — `mysql:8.0`, volume `mysql_data`, healthcheck
- `backend` — Flask, `FLASK_ENV=production`, `DATABASE_URL=mysql://...`, `JWT_SECRET_KEY` từ `.env`
- `frontend` — React build, `REACT_APP_API_URL=/api` (build args), nginx proxy `/api/` → backend

```bash
# trên EC2:
cp .env.example .env   # sửa JWT_SECRET_KEY + MYSQL_ROOT_PASSWORD
docker compose -f docker-compose.aws.yml up -d --build
docker ps
```

## 9. Seed database trong Docker

```bash
# chạy schema.sql từ file trong repo vào container MySQL
docker exec -i mysql-db mysql -uroot -p"<MYSQL_ROOT_PASSWORD>" du_an_truong < database/schema.sql

# hoặc tạo admin user:
docker exec -it mysql-db mysql -uroot -p"..." -e "INSERT INTO users (username, password_hash, role) VALUES ('admin', '...', 'admin');"
```

## 10. Kết nối MySQL bằng MySQL Workbench

1. **Security Group** mở port 3306 cho **My IP**.
2. Tạo user remote trong MySQL:

```bash
docker exec -it mysql-db mysql -uroot -p"..."
```

```sql
CREATE USER 'workbench'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON *.* TO 'workbench'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

3. Workbench: **Host** `<EC2_IP>` — **Port** `3306` — **User** `workbench` — **Password** `StrongPass123!`

## 11. Quy trình update code khi có version mới (thủ công)

```bash
cd ~/du_an_truong/du_an_truong_chung
git pull
docker compose -f docker-compose.aws.yml build backend --no-cache
docker compose -f docker-compose.aws.yml build frontend --no-cache
docker compose -f docker-compose.aws.yml up -d
docker system prune -f
```

## 12. CI/CD tự động bằng GitHub Actions

### 12.1. Chuẩn bị SSH key trên EC2

```bash
whoami                       # ubuntu
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github
cat ~/.ssh/github.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys ~/.ssh/github ~/.ssh/github.pub

# test:
ssh -i ~/.ssh/github ubuntu@<EC2_IP>
```

### 12.2. Cấp quyền Docker cho user

```bash
sudo usermod -aG docker ubuntu
exit
# ssh lại
groups          # phải có "docker"
docker ps       # không lỗi
```

### 12.3. Thêm GitHub Secrets (repo → Settings → Secrets → Actions)

| Secret | Value |
|---|---|
| `EC2_HOST` | `<EC2_IP>` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | nội dung file `~/.ssh/github` (private key) |

### 12.4. Workflow file (đã có sẵn trong repo)

`.github/workflows/deploy-ec2.yml` — CI (build + test khi PR) và CD (SSH → EC2 → git pull → docker compose build → up -d) khi push vào `main`.

Flow: PR → CI build/test → merge main → CD deploy tự động.

---

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `Permission denied (publickey)` SSH | Kiểm tra quyền `.pem` (icacls), đúng user `ubuntu` |
| `Cannot connect to Docker daemon` | `sudo usermod -aG docker ubuntu` + logout/login |
| `Can't connect to MySQL server` | Security Group mở 3306; user remote đã `GRANT ALL ON *.*` |
| Frontend gọi API lỗi CORS | `REACT_APP_API_URL=/api` (relative) + nginx proxy `/api/` |
| API trả về lỗi 404 | Check `nginx.conf` có `proxy_pass http://backend:5000;` |
| Container không lên | `docker logs <container>` xem log |
| MySQL data mất khi `down` | Không dùng `docker compose down -v` (sẽ xoá volume) |

---

# 🎤 TRẢ LỜI THẦY: "Em đã deploy rồi, data của em nằm ở đâu?"

**Câu trả lời mẫu (ngắn gọn, thuyết phục):**

> "Dạ, sau khi deploy lên AWS EC2, dữ liệu của em được lưu **trong container MySQL**, chạy trên chính instance EC2 đó. Cụ thể:
>
> 1. Em chạy MySQL 8 bằng Docker Compose trên EC2, và em mount một **Docker volume** tên `mysql_data` vào `/var/lib/mysql` bên trong container. Nghĩa là **data thực sự nằm trên ổ đĩa (EBS) của EC2**, bên ngoài container — nên khi em `docker compose down` hay build lại container, **dữ liệu vẫn còn nguyên**, không bị mất.
>
> 2. Khi CI/CD tự động deploy version mới, em chỉ chạy `docker compose up -d` (không dùng cờ `-v`), nên volume vẫn được giữ và data vẫn còn.
>
> 3. Em cũng đã cấu hình để **kết nối từ MySQL Workbench** trên máy em về MySQL trên EC2 qua port 3306 — em có thể mở database ra xem trực tiếp các bảng và dữ liệu bên trong.
>
> Nếu làm production thật sự, em sẽ nâng cấp thêm 2 hướng: (1) thay MySQL trong Docker bằng **Amazon RDS** — dịch vụ database quản lý sẵn của AWS, có backup tự động, multi-AZ; và (2) gắn **EBS snapshot định kỳ** để backup volume, hoặc dùng S3 để lưu file upload."

**Nếu thầy hỏi sâu hơn:**

| Câu hỏi | Trả lời |
|---|---|
| "Sao không dùng SQLite?" | SQLite lưu file trong container, container bị xoá là mất; MySQL + volume bền hơn, hỗ trợ nhiều user, chuẩn production. |
| "Volume nằm ở đâu vật lý?" | Trên **EBS volume** của EC2 — là ổ đĩa network-attached của AWS, tồn tại độc lập với container và (mặc định) vẫn còn khi stop/start instance. |
| "Nếu xoá EC2 thì sao?" | Volume EBS theo instance bị xoá luôn (trừ khi đặt `DeleteOnTermination=false`). Muốn an toàn hơn → dùng **Amazon RDS** để data tách hoàn toàn khỏi EC2. |
| "Backup thế nào?" | `docker exec mysql-db mysqldump -uroot -p... du_an_truong > backup.sql` hoặc EBS Snapshot, hoặc upgrade lên RDS với automated backup. |
