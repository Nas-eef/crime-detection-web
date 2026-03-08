import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoCameraOutline, IoBriefcaseOutline, IoLogOutOutline } from 'react-icons/io5';
import Colors from '../theme/colors';
import './OfficerLayout.css';

interface OfficerLayoutProps {
  children: React.ReactNode;
}

const OfficerLayout: React.FC<OfficerLayoutProps> = ({ children }) => {
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
    return location.pathname === path;
  };

  return (
    <div className="officer-layout">
      <header className="officer-header">
        <div className="officer-header-content">
          <h1 className="officer-header-title">Crime Detection System</h1>
          <div className="officer-header-right">
            <span className="officer-name">Officer: {user?.name || 'Officer'}</span>
            <button className="logout-button" onClick={handleLogout}>
              <IoLogOutOutline size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="officer-content-wrapper">
        <nav className="officer-sidebar">
          <Link
            to="/officer/live-detection"
            className={`nav-link ${isActive('/officer/live-detection') ? 'active' : ''}`}>
            <IoCameraOutline size={20} />
            <span>Live Detection</span>
          </Link>
          <Link
            to="/officer/cases"
            className={`nav-link ${isActive('/officer/cases') ? 'active' : ''}`}>
            <IoBriefcaseOutline size={20} />
            <span>Case Management</span>
          </Link>
        </nav>

        <main className="officer-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OfficerLayout;
