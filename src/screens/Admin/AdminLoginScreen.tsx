import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import '../User/LoginScreen.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN_LOGIN, { email, password });
      if (response.status >= 200 && response.status < 300) {
        const adminData = response.data.admin || response.data;
        login({ ...adminData, role: 'admin' });
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h1 className="login-title">Admin Login</h1>
          <p className="login-subtitle">Sign in to access admin dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} showPasswordToggle={true} required />
          <Button title="Sign In" onClick={handleLogin} loading={loading} type="submit" className="login-button" />
          <div className="login-links">
            <Link to="/admin/register" className="link">Register as Admin</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
