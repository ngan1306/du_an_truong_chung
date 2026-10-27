#!/bin/bash
# ============================================================
# setup-jenkins.sh — Cài đặt Jenkins trên Ubuntu Server 22.04
# Chạy 1 lần trên server Jenkins (nếu KHÔNG dùng Jenkins Docker):
#   bash setup-jenkins.sh
# ============================================================
set -e

echo "==> 1. Cập nhật hệ thống + Java 21"
sudo apt update && sudo apt upgrade -y
sudo apt install fontconfig openjdk-21-jre -y

echo "==> 2. Thêm key và repo Jenkins"
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

echo "==> 3. Cài Jenkins"
sudo apt update
sudo apt install jenkins -y

echo "==> 4. Khởi động Jenkins"
sudo systemctl enable jenkins
sudo systemctl start jenkins

echo "==> 5. Mật khẩu admin lần đầu:"
echo "----------------------------------------"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "----------------------------------------"
echo "Mở trình duyệt: http://$(hostname -I | awk '{print $1}'):8080"
