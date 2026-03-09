import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import './UserDashboardScreen.css';

interface Report {
  id: number;
  name: string;
  created_at: string;
  status: string;
  last_seen_location: string;
  date_time?: string;
  primary_image?: string;
  age?: number;
  gender?: string;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeCases: 0,
    matchesFound: 0,
    closedCases: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_USER_REPORTS}/${user?.id}`);
      if (response.data?.data) {
        const reportsData = response.data.data;
        setReports(reportsData);
        
        // Calculate stats
        setStats({
          totalReports: reportsData.length,
          activeCases: reportsData.filter((r: Report) => 
            ['submitted', 'underVerification', 'faceDetectionActive'].includes(r.status)
          ).length,
          matchesFound: reportsData.filter((r: Report) => r.status === 'matchFound').length,
          closedCases: reportsData.filter((r: Report) => r.status === 'closed').length,
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#3498DB';
      case 'underVerification': return '#F4A261';
      case 'faceDetectionActive': return '#1ABC9C';
      case 'matchFound': return '#2ECC71';
      case 'closed': return '#95A5A6';
      default: return '#6C757D';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'underVerification': return 'Under Verification';
      case 'faceDetectionActive': return 'Detection Active';
      case 'matchFound': return 'Match Found';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.name || user?.username || 'User'}</h1>
          <p className="dashboard-subtitle">Manage your missing person reports</p>
        </div>
        <div className="header-actions">
          <Button
            title="Report Missing Person"
            onClick={() => navigate('/user/report')}
            className="primary-action"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📋
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Total Reports</h3>
            <p className="stat-value">{stats.totalReports}</p>
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
            <p className="stat-value">{stats.matchesFound}</p>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            🔒
          </div>
          <div className="stat-content">
            <h3 className="stat-label">Closed Cases</h3>
            <p className="stat-value">{stats.closedCases}</p>
          </div>
        </Card>
      </div>

      {/* Reports Section */}
      <div className="reports-section">
        <div className="section-header">
          <h2 className="section-title">Your Reports</h2>
          <Button
            title="View All"
            onClick={() => navigate('/user/status')}
            variant="secondary"
          />
        </div>

        {reports.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Reports Yet</h3>
            <p>Start by reporting a missing person</p>
            <Button
              title="Report Missing Person"
              onClick={() => navigate('/user/report')}
            />
          </Card>
        ) : (
          <div className="reports-grid">
            {reports.slice(0, 6).map((report) => (
              <Card key={report.id} className="report-card" onClick={() => navigate('/user/status')}>
                {report.primary_image && (
                  <div className="report-image">
                    <img
                      src={`${api.defaults.baseURL}/${report.primary_image}`}
                      alt={report.name}
                    />
                  </div>
                )}
                <div className="report-content">
                  <div className="report-header">
                    <h3 className="report-name">{report.name}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                  <p className="report-location">📍 {report.last_seen_location}</p>
                  <p className="report-date">📅 {formatDate(report.date_time || report.created_at)}</p>
                  {report.age && (
                    <p className="report-details">
                      {report.age} years old {report.gender ? `• ${report.gender}` : ''}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Card className="action-card" onClick={() => navigate('/user/report')}>
          <div className="action-icon">➕</div>
          <h3>Report Missing Person</h3>
          <p>Submit a new missing person case</p>
        </Card>

        <Card className="action-card" onClick={() => navigate('/user/status')}>
          <div className="action-icon">📊</div>
          <h3>Track Status</h3>
          <p>View all your reports and their status</p>
        </Card>

        <Card className="action-card" onClick={() => navigate('/user/support')}>
          <div className="action-icon">💬</div>
          <h3>Support</h3>
          <p>Get help and contact information</p>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
