import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Space, 
  Typography,
  Badge,
  Drawer,
  ConfigProvider
} from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  MenuOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  showAuth?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showAuth = true }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenu = (
    <Menu 
      className="user-dropdown-menu"
      style={{ 
        minWidth: '200px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '4px 0',
        background: '#ffffff'
      }}
    >
      {/* User Info Header */}
      <div className="user-info-section">
        <div className="user-name">
          {user?.fullName}
        </div>
        <div className="user-role">
          {user?.role}
        </div>
      </div>
      
      <Menu.Item 
        key="profile" 
        className="dropdown-menu-item"
      >
        <Link to="/profile">Profile</Link>
      </Menu.Item>
      <Menu.Item 
        key="settings" 
        className="dropdown-menu-item"
      >
        <Link to="/settings">Settings</Link>
      </Menu.Item>
      <Menu.Divider className="menu-divider" />
      <Menu.Item 
        key="logout" 
        onClick={handleLogout}
        className="dropdown-menu-item logout-item"
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  // Different menu items based on authentication status
  const authenticatedMenuItems = [
    {
      key: '/dashboard',
      label: <Link to="/dashboard">Dashboard</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/practice',
      label: <Link to="/practice">Practice</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/exams',
      label: <Link to="/exams">Exams</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/study-materials',
      label: <Link to="/study-materials">Study Materials</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/analytics',
      label: <Link to="/analytics">Analytics</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/help',
      label: <Link to="/help">Help</Link>,
      className: 'nav-menu-item'
    },
  ];

  const unauthenticatedMenuItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/about',
      label: <Link to="/about">About</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/help',
      label: <Link to="/help">Help</Link>,
      className: 'nav-menu-item'
    },
    {
      key: '/contact',
      label: <Link to="/contact">Contact</Link>,
      className: 'nav-menu-item'
    },
  ];

  const mainMenuItems = isAuthenticated ? authenticatedMenuItems : unauthenticatedMenuItems;

  const mobileMenuItems = [
    ...mainMenuItems,
    ...(isAuthenticated ? [] : [
      {
        key: '/about',
        label: <Link to="/about">About</Link>,
      },
      {
        key: '/contact',
        label: <Link to="/contact">Contact</Link>,
      },
    ]),
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <AntHeader className="main-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-left">
            <Link 
              to={isAuthenticated ? '/dashboard' : '/'} 
              className="logo-link"
            >
              <div className="logo-container">
                <Text className="logo-text">Siklo</Text>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <Menu 
              theme="light" 
              mode="horizontal" 
              selectedKeys={[location.pathname]} 
              items={mainMenuItems}
              className="nav-menu"
            />
          </div>

          {/* Right Side */}
          <div className="header-right">
          {/* Notifications - Only show when authenticated */}
          {isAuthenticated && (
            <div className="notification-wrapper">
              <Badge 
                count={3} 
                size="small" 
                className="notification-badge"
              >
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  className="notification-btn"
                />
              </Badge>
            </div>
          )}

          {/* Authentication */}
          {showAuth && (
            <>
              {isAuthenticated ? (
                <div className="user-dropdown-wrapper">
                  <Dropdown 
                    overlay={userMenu} 
                    placement="bottomRight" 
                    arrow 
                    trigger={['click']}
                    overlayClassName="user-dropdown-overlay"
                  >
                    <div className="user-avatar-trigger">
                      <Avatar 
                        size={28} 
                        src={user?.profilePictureUrl}
                        icon={<UserOutlined />} 
                        className="user-avatar"
                      />
                      <span className="user-name-trigger">{user?.fullName?.split(' ')[0]}</span>
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <Space size="small" className="auth-buttons">
                  <Link to="/login">
                    <Button 
                      type="text" 
                      className="login-btn"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      type="primary" 
                      className="signup-btn"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </Space>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={() => setDrawerVisible(true)}
            className="mobile-menu-btn"
          />
          </div>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={
            <div className="drawer-title">
              Siklo
            </div>
          }
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          className="mobile-drawer"
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={mobileMenuItems}
            className="mobile-menu"
          />
          
          {isAuthenticated && (
            <>
              <Menu.Divider style={{ margin: '12px 0' }} />
              <Menu
                mode="vertical"
                className="mobile-menu"
              >
                <Menu.Item key="profile-mobile">
                  <Link to="/profile">Profile</Link>
                </Menu.Item>
                <Menu.Item key="settings-mobile">
                  <Link to="/settings">Settings</Link>
                </Menu.Item>
                <Menu.Item 
                  key="logout-mobile" 
                  onClick={handleLogout}
                  className="logout-item"
                >
                  Logout
                </Menu.Item>
              </Menu>
            </>
          )}
        </Drawer>
      </AntHeader>
    </ConfigProvider>
  );
};