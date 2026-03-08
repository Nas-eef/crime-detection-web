import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import './LoginScreen.css';

const UserLogin: React.FC = () => {
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
      const response = await api.post(API_ENDPOINTS.USER_LOGIN, {
        email,
        password,
      });

      if (response.status >= 200 && response.status < 300) {
        const userData = response.data.user;
        if (userData && userData.id) {
          localStorage.setItem('userId', userData.id.toString());
          localStorage.setItem('userData', JSON.stringify(userData));
          login({ ...userData, role: 'user' });
          navigate('/user/dashboard');
        }
      }
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        const errorData = error.response.data;
        if (error.response.status === 423) {
          const minutesRemaining = errorData.minutesRemaining || 10;
          setError(
            `Account locked. Please try again after ${minutesRemaining} minutes.`
          );
        } else if (error.response.status === 401) {
          const remainingAttempts = errorData.remainingAttempts || 0;
          setError(
            `Invalid credentials. ${remainingAttempts > 0 ? `Remaining attempts: ${remainingAttempts}` : 'Account will be locked.'}`
          );
        } else {
          setError(errorData?.error || errorData?.message || 'Login failed');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <Input
            label="Email / Mobile Number"
            placeholder="Enter your email or mobile"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            required
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle={true}
            required
          />

          <Button
            title="Sign In"
            onClick={handleLogin}
            loading={loading}
            type="submit"
            className="login-button"
          />

          <div className="login-links">
            <Link to="/user/register" className="link">
              Don't have an account? Sign Up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserLogin;
