import React from 'react';
import { Card } from '../../components';
import './PrivacySupportScreen.css';

const PrivacySupportScreen: React.FC = () => {
  return (
    <div className="privacy-container">
      <h1 className="privacy-title">Privacy & Support</h1>
      
      <Card className="privacy-card">
        <h2>Privacy Policy</h2>
        <p>
          Your privacy is important to us. All personal information and images are securely stored
          and used only for the purpose of missing person detection and case management.
        </p>
      </Card>

      <Card className="privacy-card">
        <h2>Data Security</h2>
        <p>
          We use industry-standard encryption and security measures to protect your data.
          Images are processed using AI technology and stored securely in our database.
        </p>
      </Card>

      <Card className="privacy-card">
        <h2>Support</h2>
        <p>
          For assistance, please contact our support team or visit our help center.
        </p>
      </Card>
    </div>
  );
};

export default PrivacySupportScreen;
