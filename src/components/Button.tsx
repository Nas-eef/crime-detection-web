import React from 'react';
import Colors from '../theme/colors';
import './Button.css';

interface ButtonProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.border;
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'danger':
        return Colors.error;
      case 'success':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ backgroundColor: getBackgroundColor() }}>
      {loading ? (
        <span className="btn-loading-content">
          <span className="btn-spinner"></span>
          <span className="btn-loading-text">{title}</span>
        </span>
      ) : (
        title
      )}
    </button>
  );
};

export default Button;
