import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/unified-login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-title">Crime Detection System</h1>
        <p className="splash-subtitle">AI-Powered Face Recognition & Missing Person Detection</p>
        <div className="splash-loader"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
