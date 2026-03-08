import React from 'react';
import { Card } from '../../components';
import './DatabaseManagementScreen.css';

const DatabaseManagementScreen: React.FC = () => {
  return (
    <div className="database-container">
      <h1 className="database-title">Database Management</h1>
      <Card>
        <p>Database management features will be displayed here.</p>
      </Card>
    </div>
  );
};

export default DatabaseManagementScreen;
