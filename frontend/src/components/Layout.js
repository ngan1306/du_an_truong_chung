import React from 'react';
import { Menu, Layout, Avatar, Dropdown, Button } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, LaptopOutlined, CheckCircleOutlined, BankOutlined, FolderOutlined, LockOutlined, BellOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const { Sider, Content, Header } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: <Link to="/profile">Hồ Sơ Cá Nhân</Link>,
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng Xuất",
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Bảng Điều Khiển</Link>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Tài Khoản',
      children: [
        { key: '/users', label: <Link to="/users">Quản Lý Người Dùng</Link> },
        { key: '/employees', label: <Link to="/employees">Nhân Sự</Link> },
      ],
    },
    {
      key: '/devices',
      icon: <LaptopOutlined />,
      label: <Link to="/devices">Quản Lý Thiết Bị</Link>,
    },
    {
      key: '/tasks',
      icon: <CheckCircleOutlined />,
      label: <Link to="/tasks">Công Việc</Link>,
    },
    {
      key: '/departments',
      icon: <BankOutlined />,
      label: <Link to="/departments">Bộ Phận</Link>,
    },
    {
      key: '/storage',
      icon: <FolderOutlined />,
      label: <Link to="/storage">Bộ Lưu Trữ</Link>,
    },
    {
      key: '/permissions',
      icon: <LockOutlined />,
      label: <Link to="/permissions">Phân Quyền</Link>,
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: <Link to="/notifications">Thông Báo</Link>,
    },
    {
      key: '/logs',
      icon: <FileTextOutlined />,
      label: <Link to="/logs">Nhật Ký</Link>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: <Link to="/reports">Báo Cáo & Thống Kê</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} className="sidebar">
        <div className="logo">
          <h2>Quản Lý Thiết Bị</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="sidebar-menu"
        />
      </Sider>

      <Layout>
        <Header className="header">
          <div className="header-content">
            <h1 className="app-title">APP HỆ THỐNG QUẢN LÝ THIẾT BỊ DOANH NGHIỆP</h1>
            <div className="user-section">
              <Dropdown menu={userMenu}>
                <Button type="text" className="user-button">
                  <Avatar size={32} icon={<UserOutlined />} />
                  {user?.full_name}
                </Button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className="main-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
