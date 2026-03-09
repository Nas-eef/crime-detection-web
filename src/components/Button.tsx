import React from 'react';
import Colors from '../theme/colors';
import './Button.css';

interface ButtonProps {
  title: string;
  // Accept any function that takes an event (or no params) and returns void or Promise<void>
  onClick?: ((e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void | Promise<void>) | 
            ((e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>) |
            ((e: React.FormEvent) => void | Promise<void>) |
            (() => void | Promise<void>);
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      // Cast to any to handle different function signatures (required vs optional event)
      const result = (onClick as any)(e);
      // Handle promise if async
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error('Button onClick error:', error);
        });
      }
    }
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={handleClick}
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
