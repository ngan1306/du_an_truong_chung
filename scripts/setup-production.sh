#!/bin/bash
# ============================================================
# setup-production.sh — Chuẩn bị Production Server (Ubuntu)
# Chạy 1 lần trên server production:
#   bash setup-production.sh
# ============================================================
set -e

echo "==> 1. Cập nhật hệ thống"
sudo apt update && sudo apt upgrade -y

echo "==> 2. Cài Docker Engine + Compose plugin"
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> 3. Kiểm tra Docker"
sudo docker run --rm hello-world

echo "==> 4. Thư mục dự án"
mkdir -p ~/project

echo "==> 5. (Tùy chọn) Tạo .env mặc định — sửa lại giá trị thật sau"
if [ ! -f ~/project/.env ]; then
  cat > ~/project/.env <<'EOF'
JWT_SECRET_KEY=change-this-secret
EOF
fi

echo "==> 6. Mở firewall (nếu dùng ufw)"
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 5000/tcp || true

echo "✅ Hoàn tất. Server đã sẵn sàng nhận deploy từ Jenkins."
