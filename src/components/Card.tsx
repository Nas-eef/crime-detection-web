import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`card ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
