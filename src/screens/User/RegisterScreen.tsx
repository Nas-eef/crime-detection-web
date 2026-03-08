import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './RegisterScreen.css';

const UserRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    mobile?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Real-time validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return undefined;
    const phoneRegex = /^[6789]\d{9}$/;
    if (phone.length > 0 && phone.length < 10) {
      return 'Phone number must be 10 digits';
    }
    if (phone.length === 10 && !phoneRegex.test(phone)) {
      return 'Phone number must start with 6, 7, 8, or 9';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return undefined;
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/^[A-Z]/.test(password)) {
      return 'Password must start with an uppercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one digit';
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return undefined;
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  // Export validatePassword for form submission
  const validatePasswordForSubmit = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/^[A-Z]/.test(password)) {
      return 'Password must start with an uppercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one digit';
    }
    return undefined;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Real-time validation
    let fieldError: string | undefined;
    
    switch (field) {
      case 'email':
        fieldError = validateEmail(value);
        break;
      case 'mobile':
        fieldError = validatePhone(value);
        break;
      case 'password':
        fieldError = validatePassword(value);
        // Also re-validate confirm password if it has a value
        if (formData.confirmPassword) {
          setFieldErrors({
            ...fieldErrors,
            password: fieldError,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
          });
          return;
        }
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(value, formData.password);
        break;
    }
    
    setFieldErrors({ ...fieldErrors, [field]: fieldError });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    // Phone number validation: 10 digits, must start with 6/7/8/9
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(formData.mobile)) {
      setError('Phone number must be 10 digits and start with 6, 7, 8, or 9');
      return;
    }

    // Password validation
    const passwordError = validatePasswordForSubmit(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(API_ENDPOINTS.USER_REGISTER, {
        name: formData.name,
        email: formData.email,
        phone: formData.mobile,
        password: formData.password,
      });

      setLoading(false);
      alert(response.data.message || 'Registration successful!');
      navigate('/user/login');
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        setError(error.response.data?.error || error.response.data?.message || 'Registration failed');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Register to report missing persons</p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          {error && <div className="error-message">{error}</div>}

          <Input
            label="Full Name *"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={fieldErrors.name}
            required
          />

          <Input
            label="Email Address *"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            type="email"
            error={fieldErrors.email}
            required
          />

          <Input
            label="Mobile Number *"
            placeholder="Enter your mobile number (10 digits)"
            value={formData.mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              handleFieldChange('mobile', value);
            }}
            type="tel"
            maxLength={10}
            error={fieldErrors.mobile}
            required
          />

          <Input
            label="Password *"
            placeholder="Enter your password (8+ chars, uppercase first, special char, digit)"
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            showPasswordToggle={true}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirm Password *"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            showPasswordToggle={true}
            error={fieldErrors.confirmPassword}
            required
          />

          <Button
            title="Register"
            onClick={handleRegister}
            loading={loading}
            type="submit"
            className="register-button"
          />

          <div className="register-links">
            <Link to="/user/login" className="link">
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserRegister;
