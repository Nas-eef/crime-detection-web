import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components';
import Colors from '../theme/colors';
import './UnifiedLoginScreen.css';

const UnifiedLoginScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unified-login-container">
      <div className="unified-login-content">
        <h1 className="unified-login-title">Crime Detection System</h1>
        <p className="unified-login-subtitle">Select your role to continue</p>

        <div className="role-buttons">
          <Card className="role-card" onClick={() => navigate('/user/login')}>
            <div className="role-icon">👤</div>
            <h2 className="role-title">User</h2>
            <p className="role-description">Report missing persons and track cases</p>
            <Button title="Login as User" onClick={() => navigate('/user/login')} />
          </Card>

          <Card className="role-card" onClick={() => navigate('/officer/login')}>
            <div className="role-icon">👮</div>
            <h2 className="role-title">Officer</h2>
            <p className="role-description">Live detection and case management</p>
            <Button title="Login as Officer" onClick={() => navigate('/officer/login')} />
          </Card>

          <Card className="role-card" onClick={() => navigate('/admin/login')}>
            <div className="role-icon">🛡️</div>
            <h2 className="role-title">Admin</h2>
            <p className="role-description">System administration and analytics</p>
            <Button title="Login as Admin" onClick={() => navigate('/admin/login')} />
          </Card>
        </div>

        <div className="register-links">
          <p>
            Don't have an account?{' '}
            <span className="link" onClick={() => navigate('/user/register')}>
              Register as User
            </span>
          </p>
          <p style={{ marginTop: '12px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Officer and Admin accounts are managed by system administrators
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginScreen;
