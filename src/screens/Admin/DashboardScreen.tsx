import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import './DashboardScreen.css';

interface Stats {
  totalCases: number;
  activeCases: number;
  totalUsers: number;
  totalOfficers: number;
  matchesFound?: number;
  closedCases?: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [stats, setStats] = useState<Stats>({ 
    totalCases: 0, 
    activeCases: 0, 
    totalUsers: 0, 
    totalOfficers: 0,
    matchesFound: 0,
    closedCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_STATISTICS);
      console.log('Dashboard Stats API Response:', response.data);
      
      if (response.data) {
        setStats({
          totalCases: parseInt(response.data.totalCases) || 0,
          activeCases: parseInt(response.data.activeCases) || 0,
          matchesFound: parseInt(response.data.matchesFound) || 0,
          closedCases: parseInt(response.data.closedCases) || 0,
          totalUsers: parseInt(response.data.totalUsers) || 0,
          totalOfficers: parseInt(response.data.totalOfficers) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Welcome, {user?.name || user?.username || 'Admin'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📋
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Cases</h3>
            <p className="stat-value">{stats.totalCases}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            🔍
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Active Cases</h3>
            <p className="stat-value">{stats.activeCases}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            ✅
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Matches Found</h3>
            <p className="stat-value">{stats.matchesFound || 0}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            👥
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            👮
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Officers</h3>
            <p className="stat-value">{stats.totalOfficers}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
            🔒
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Closed Cases</h3>
            <p className="stat-value">{stats.closedCases || 0}</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Card className="action-card" onClick={() => navigate('/admin/users')}>
            <div className="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View and manage user accounts</p>
          </Card>

          <Card className="action-card" onClick={() => navigate('/admin/officers')}>
            <div className="action-icon">👮</div>
            <h3>Manage Officers</h3>
            <p>View and manage officer accounts</p>
          </Card>

          <Card className="action-card" onClick={() => navigate('/admin/analytics')}>
            <div className="action-icon">📊</div>
            <h3>Analytics</h3>
            <p>View system analytics and reports</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
