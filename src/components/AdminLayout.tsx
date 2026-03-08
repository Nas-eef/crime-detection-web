import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IoHomeOutline, 
  IoPeopleOutline, 
  IoShieldCheckmarkOutline, 
  IoBarChartOutline, 
  IoLogOutOutline,
  IoPersonOutline
} from 'react-icons/io5';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
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
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-header-title">Crime Detection System</h1>
            <span className="admin-role-badge">Admin Portal</span>
          </div>
          <div className="admin-header-right">
            <div className="admin-info">
              <IoPersonOutline size={18} />
              <span className="admin-name">{user?.name || user?.username || 'Admin'}</span>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <IoLogOutOutline size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content-wrapper">
        <nav className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Administration</h2>
          </div>
          <div className="nav-links">
            <Link
              to="/admin/dashboard"
              className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              <IoHomeOutline size={20} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/users"
              className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
              <IoPeopleOutline size={20} />
              <span>Manage Users</span>
            </Link>
            <Link
              to="/admin/officers"
              className={`nav-link ${isActive('/admin/officers') ? 'active' : ''}`}>
              <IoShieldCheckmarkOutline size={20} />
              <span>Manage Officers</span>
            </Link>
            <Link
              to="/admin/analytics"
              className={`nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}>
              <IoBarChartOutline size={20} />
              <span>Analytics</span>
            </Link>
          </div>
        </nav>

        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
