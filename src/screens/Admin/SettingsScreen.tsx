import React from 'react';
import { Card } from '../../components';
import './SettingsScreen.css';

const SettingsScreen: React.FC = () => {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      <Card>
        <p>System settings will be displayed here.</p>
      </Card>
    </div>
  );
};

export default SettingsScreen;
