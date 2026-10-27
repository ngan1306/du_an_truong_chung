# 🚀 CI/CD Jenkins + Docker + GitHub — Hướng dẫn Step-by-Step

> Áp dụng cho project **du_an_truong_chung** (Flask backend + React frontend).
> Flow: **Git → Jenkins → Build → Test → Docker Build → Push Docker Hub → Deploy Production (SSH)**

## Kiến trúc tổng thể

```
[Developer] --git push--> [GitHub repo]
                              │ (webhook / build now)
                              ▼
                        [Jenkins Server :8080]
                              │ 1. Checkout
                              │ 2. Build (Flask + React)
                              │ 3. Test (pytest + jest)
                              │ 4. Docker build 2 image
                              │ 5. Push → Docker Hub
                              ▼
                        [Production Server]
                        docker compose pull + up -d
                        ├── backend  :5000
                        └── frontend :80 (nginx)
```

## Yêu cầu

| Thành phần | Yêu cầu |
|---|---|
| OS | Ubuntu Server 22.04 LTS |
| RAM / Disk | ≥ 2GB (khuyến nghị 4GB) / ≥ 30GB |
| Port mở | 8080 (Jenkins), 22 (SSH), 80 + 5000 (Web app) |
| Tài khoản | GitHub, Docker Hub |
| Máy chủ | Jenkins server (có thể trùng production), Production server |

---

## PHẦN 1: Cài Jenkins trên server

```bash
# 1.1. Update hệ thống + Java
sudo apt update && sudo apt upgrade -y
sudo apt install fontconfig openjdk-21-jre -y

# 1.2. Thêm key và repo Jenkins
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 1.3. Cài Jenkins
sudo apt update
sudo apt install jenkins -y
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

**Truy cập web:** `http://<server-ip>:8080` → lấy mật khẩu:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

→ wizard: tạo admin user → **Install suggested plugins**.

### Cách B: Chạy Jenkins bằng Docker (đã có sẵn trong repo)

```bash
docker compose -f docker-compose.devops.yml up -d jenkins
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

> `jenkins/Dockerfile` trong repo đã cài sẵn: Docker CLI + Compose plugin, Python 3, Node 20, npm, git — đủ để chạy toàn bộ pipeline.

---

## PHẦN 2: Cài Docker & Docker Compose trên server

```bash
# 2.1. Add Docker's official GPG key
sudo apt-get update
sudo apt-get install ca-certificates curl -y
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 2.2. Add the repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 2.3. Cài Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin -y

# 2.4. Cho jenkins + user quyền docker
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# 2.5. Kiểm tra
docker run --rm hello-world
```

---

## PHẦN 3: Chuẩn bị Production server

Chạy 1 lần trên production server (script có sẵn trong repo: `scripts/setup-production.sh`):

```bash
bash setup-production.sh
```

Script làm: update hệ thống → cài Docker + Compose → tạo `~/project/` → tạo `.env` mẫu → mở firewall (22/80/5000).

**Thêm SSH key cho Jenkins:** trên Jenkins server (user `jenkins`):

```bash
sudo -u jenkins ssh-keygen -t ed25519 -N "" -f /var/lib/jenkins/.ssh/id_ed25519
# Copy public key sang production server:
sudo cat /var/lib/jenkins/.ssh/id_ed25519.pub | ssh user@SERVER_IP \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

---

## PHẦN 4: Dockerfile (đã có sẵn trong repo)

| File | Nội dung |
|---|---|
| `backend/Dockerfile` | `python:3.13-slim` → cài requirements → chạy Flask app, EXPOSE 5000 |
| `frontend/Dockerfile` | Multi-stage: `node:20-alpine` build → `nginx:alpine` serve, EXPOSE 80 |
| `jenkins/Dockerfile` | Jenkins LTS + Docker CLI + Python + Node (chạy Jenkins bằng Docker) |

---

## PHẦN 5: docker-compose.prod.yml (đã có sẵn trong repo)

Production **không build** — chỉ **pull image từ Docker Hub**:

```yaml
services:
  backend:
    image: docker.io/${DOCKER_USERNAME}/du-an-truong-chung-backend:latest
    ports: ["5000:5000"]
  frontend:
    image: docker.io/${DOCKER_USERNAME}/du-an-truong-chung-frontend:latest
    ports: ["80:80"]
```

---

## PHẦN 6: Kết nối GitHub → Jenkins

### 6.1. Tạo PAT (Personal Access Token)
GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens**
Scope: `repo (read)`, `admin:repo_hook`. Copy token.

### 6.2. Add vào Jenkins
**Manage Jenkins → Credentials → Global → Add Credentials**

| ID | Kind | Nội dung |
|---|---|---|
| `github-pat` | Username with password | GitHub username + PAT |
| `dockerhub-cred` | Username with password | Docker Hub username + Access Token |
| `server-ssh-key` | SSH Username with private key | Private key đăng nhập production server |

### 6.3. Tạo webhook GitHub
Repo → **Settings → Webhooks → Add webhook**
- URL: `http://<jenkins-server>:8080/github-webhook/`
- Content type: `application/json`
- Trigger: **push events**

---

## PHẦN 7: Jenkinsfile — các stage

Stage trong `Jenkinsfile` (pipeline script from SCM, branch `main`):

| # | Stage | Lệnh chính |
|---|---|---|
| 1 | Checkout | `checkout GitSCM` (credentialsId: `github-pat`) |
| 2 | Build Backend | `python -m venv venv` + `pip install -r requirements.txt` |
| 2 | Build Frontend | `npm ci` + `npm run build` |
| 3 | Test Backend | `python -m pytest -v` |
| 3 | Test Frontend | `npm test -- --watchAll=false --passWithNoTests` |
| 4 | Docker Build | `docker build -t docker.io/$USER/backend:latest ./backend` (+ frontend) |
| 5 | Push Docker Hub | `docker login` + `docker push` 2 image |
| 6 | Deploy Production | `scp docker-compose.prod.yml` + `ssh` → `docker compose pull && up -d` |

> ⭐ Trước khi chạy: sửa biến `SERVER_HOST`, `SERVER_USER` trong `Jenkinsfile` cho khớp production server của bạn.

---

## PHẦN 8: Tạo Jenkins Pipeline Job

1. **Dashboard → New Item → Pipeline** → đặt tên (vd: `du-an-truong-chung-CICD`) → OK
2. **Pipeline → Definition: `Pipeline script from SCM`**
3. **SCM: Git** → Repository URL → branch `*/main` → credentials `github-pat`
4. **Script Path**: `Jenkinsfile`
5. **Save** → bấm **Build Now** để test

---

## PHẦN 9: Test Pipeline trọn vòng

1. Sửa 1 file bất kỳ → `git commit` + `git push` → Jenkins tự chạy (webhook) hoặc **Build Now**
2. Xem Console Output: từng stage phải xanh ✅
3. Trên production server kiểm tra:

```bash
docker ps                      # thấy du-an-backend + du-an-frontend
docker logs du-an-backend      # log Flask
curl http://<server-ip>/       # app frontend
curl http://<server-ip>:5000/  # API backend
```

4. Docker Hub: vào trang repo của bạn → thấy tag `latest` mới cập nhật.

---

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `Permission denied (publickey)` khi SSH deploy | Kiểm tra private key trong credential `server-ssh-key`, public key đã nằm trong `~/.ssh/authorized_keys` trên server |
| `denied: requested access to the resource is denied` khi push | Docker Hub username sai hoặc chưa tạo Access Token; kiểm tra credential `dockerhub-cred` |
| Jenkins không chạy được `docker` | Đã mount `/var/run/docker.sock` + `usermod -aG docker jenkins` → restart Jenkins |
| `manifest unknown` khi pull trên server | Chưa push image, hoặc `DOCKER_USERNAME` trong `.env` trên server sai |
| Webhook không trigger | Jenkins URL phải truy cập được từ GitHub; check payload trong GitHub → Webhooks → Recent Deliveries |
| Port đã được dùng khi `up -d` | `docker compose down` trước, hoặc đổi port mapping |
