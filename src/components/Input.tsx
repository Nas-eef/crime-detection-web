import React, { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import Colors from '../theme/colors';
import './Input.css';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  showPasswordToggle = false,
  type,
  className = '',
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const inputType = showPasswordToggle
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type || 'text';

  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        <input
          type={inputType}
          className={`input ${error ? 'input-error' : ''} ${showPasswordToggle ? 'input-with-icon' : ''} ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="input-eye-icon"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            tabIndex={-1}>
            {isPasswordVisible ? (
              <IoEyeOffOutline size={20} color={Colors.textSecondary} />
            ) : (
              <IoEyeOutline size={20} color={Colors.textSecondary} />
            )}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;
