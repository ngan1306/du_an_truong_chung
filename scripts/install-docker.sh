#!/bin/bash
# ============================================================
# install-docker.sh — Cài Docker + Docker Compose trên Ubuntu EC2
# Chạy: bash install-docker.sh
# ============================================================
set -e
sudo apt update
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
# Cho user hiện tại chạy docker không cần sudo (cần logout/login lại)
sudo usermod -aG docker $USER || true
docker --version
docker compose version
