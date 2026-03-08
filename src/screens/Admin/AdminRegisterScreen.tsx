import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import '../User/RegisterScreen.css';

const AdminRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN_REGISTER, formData);
      alert('Registration successful!');
      navigate('/admin/login');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <div className="register-header">
          <h1 className="register-title">Admin Registration</h1>
        </div>
        <form onSubmit={handleRegister} className="register-form">
          {error && <div className="error-message">{error}</div>}
          <Input label="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} type="email" required />
          <Input label="Password *" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} showPasswordToggle={true} required />
          <Input label="Confirm Password *" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} showPasswordToggle={true} required />
          <Button title="Register" onClick={handleRegister} loading={loading} type="submit" className="register-button" />
          <div className="register-links">
            <Link to="/admin/login" className="link">Already have an account? Sign In</Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminRegister;
