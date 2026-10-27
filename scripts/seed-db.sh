#!/bin/bash
# ============================================================
# seed-db.sh — Seed database trong Docker container MySQL
# Chạy trên EC2 sau khi `docker compose -f docker-compose.aws.yml up -d`:
#   bash seed-db.sh
# ============================================================
set -e

MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-change-this-password}"
DB_NAME="${MYSQL_DATABASE:-du_an_truong}"

echo "==> 1. Chờ MySQL sẵn sàng..."
until docker exec mysql-db mysqladmin ping -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent; do
  echo "   Đang chờ MySQL..."
  sleep 3
done

echo "==> 2. Nạp schema.sql vào database ${DB_NAME}"
docker exec -i mysql-db mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${DB_NAME}" < database/schema.sql

echo "==> 3. Tạo user remote cho MySQL Workbench"
docker exec mysql-db mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
CREATE USER IF NOT EXISTS 'workbench'@'%' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON *.* TO 'workbench'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"

echo "✅ Hoàn tất seed database + tạo user remote 'workbench'."
echo "   MySQL Workbench: Host = <EC2_IP>, Port = 3306, User = workbench, Password = StrongPass123!"
