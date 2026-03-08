import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IoHomeOutline, 
  IoAddCircleOutline, 
  IoDocumentTextOutline, 
  IoHelpCircleOutline, 
  IoLogOutOutline,
  IoPersonOutline
} from 'react-icons/io5';
import './UserLayout.css';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/unified-login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="user-layout">
      <header className="user-header">
        <div className="user-header-content">
          <div className="user-header-left">
            <h1 className="user-header-title">Crime Detection System</h1>
            <span className="user-role-badge">User Portal</span>
          </div>
          <div className="user-header-right">
            <div className="user-info">
              <IoPersonOutline size={18} />
              <span className="user-name">{user?.name || user?.username || 'User'}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <IoLogOutOutline size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="user-content-wrapper">
        <nav className="user-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Navigation</h2>
          </div>
          <div className="nav-links">
            <Link
              to="/user/dashboard"
              className={`nav-link ${isActive('/user/dashboard') ? 'active' : ''}`}>
              <IoHomeOutline size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/user/report"
              className={`nav-link ${isActive('/user/report') ? 'active' : ''}`}>
              <IoAddCircleOutline size={20} />
              <span>Report Missing Person</span>
            </Link>
            <Link
              to="/user/status"
              className={`nav-link ${isActive('/user/status') ? 'active' : ''}`}>
              <IoDocumentTextOutline size={20} />
              <span>Track Status</span>
            </Link>
            <Link
              to="/user/support"
              className={`nav-link ${isActive('/user/support') ? 'active' : ''}`}>
              <IoHelpCircleOutline size={20} />
              <span>Support & Privacy</span>
            </Link>
          </div>
        </nav>

        <main className="user-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
