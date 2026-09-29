# Ứng Dụng Quản Lý Thiết Bị Doanh Nghiệp

Một ứng dụng web hoàn chỉnh để quản lý thiết bị, nhân sự, công việc, và các bộ phận trong một doanh nghiệp.

## 🚀 Tính Năng

### 10 Modules Chính:
1. **Tài Khoản** - Quản lý người dùng và đăng nhập
2. **Quản Lý Thiết Bị** - Theo dõi tất cả thiết bị trong doanh nghiệp
3. **Công Việc** - Quản lý nhiệm vụ và tiến độ
4. **Nhân Sự** - Quản lý thông tin nhân viên
5. **Bộ Phận** - Quản lý các bộ phận của công ty
6. **Bộ Lưu Trữ** - Quản lý kho lưu trữ
7. **Phân Quyền** - Quản lý quyền truy cập
8. **Thông Báo** - Thông báo cho người dùng
9. **Nhật Ký** - Ghi log hoạt động hệ thống
10. **Báo Cáo & Thống Kê** - Tạo báo cáo và phân tích dữ liệu

## 📋 Yêu Cầu Hệ Thống

- Node.js 16+ (cho Frontend)
- Python 3.8+ (cho Backend)
- PostgreSQL 12+ (cho Database)
- npm hoặc yarn

## 🛠️ Cài Đặt

### 1. Cài Đặt Database

```bash
# Tạo database PostgreSQL
psql -U postgres
CREATE DATABASE enterprise_management;

# Import schema
psql -U postgres -d enterprise_management -f database/schema.sql
```

### 2. Cài Đặt Backend (Python/Flask)

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env

# Chạy server
python app.py
```

Backend sẽ chạy tại: `http://localhost:5000`

### 3. Cài Đặt Frontend (React)

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chạy development server
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📝 Cấu Hình

### Backend (.env)
```
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/enterprise_management
JWT_SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Thông Tin Đăng Nhập Demo

- **Username**: admin
- **Password**: admin123

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### Users
- `GET /api/users` - Danh sách người dùng
- `GET /api/users/<id>` - Chi tiết người dùng
- `POST /api/users` - Tạo người dùng
- `PUT /api/users/<id>` - Cập nhật người dùng
- `DELETE /api/users/<id>` - Xóa người dùng

### Devices
- `GET /api/devices` - Danh sách thiết bị
- `POST /api/devices` - Tạo thiết bị
- `PUT /api/devices/<id>` - Cập nhật thiết bị

### Tasks
- `GET /api/tasks` - Danh sách công việc
- `POST /api/tasks` - Tạo công việc
- `PUT /api/tasks/<id>` - Cập nhật công việc

### Departments
- `GET /api/departments` - Danh sách bộ phận
- `POST /api/departments` - Tạo bộ phận

## 📁 Cấu Trúc Thư Mục

```
du_an_truong/
├── backend/                    # Flask API
│   ├── app.py                 # Application entry point
│   ├── config.py              # Configuration
│   ├── models.py              # Database models
│   ├── routes.py              # API routes
│   ├── requirements.txt        # Dependencies
│   └── .env.example           # Environment template
├── frontend/                   # React App
│   ├── public/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React context (Auth)
│   │   ├── api.js            # API client
│   │   └── App.js            # Main app component
│   ├── package.json          # Dependencies
│   └── .env.example          # Environment template
└── database/
    └── schema.sql            # Database schema
```

## 🎨 Công Nghệ

### Frontend
- React 18
- React Router v6
- Ant Design
- Axios
- CSS3

### Backend
- Flask 2.3
- SQLAlchemy ORM
- PostgreSQL
- Flask-CORS
- PyJWT

## 🚀 Triển Khai

### Build Frontend
```bash
cd frontend
npm run build
```

### Production Backend
```bash
cd backend
FLASK_ENV=production python app.py
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
- Database connection string trong `.env`
- Cổng 5000 (Backend) và 3000 (Frontend) khả dụng
- Tất cả dependencies đã được cài đặt

## 📄 Giấy Phép

MIT License

## 👨‍💻 Tác Giả

Created for enterprise management system
Ngân
---

## Thực hành Git

Project được quản lý mã nguồn bằng Git và GitHub.

## Kiểm tra CI/CD

Dự án đã triển khai CI/CD bằng GitHub Actions, Docker và Render.

**Lưu ý**: Đây là ứng dụng demo. Hãy đảm bảo thay đổi `JWT_SECRET_KEY` và các cấu hình bảo mật khác trước khi triển khai lên production.
