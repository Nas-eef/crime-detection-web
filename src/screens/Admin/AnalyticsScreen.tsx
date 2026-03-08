import React, { useState, useEffect } from 'react';
import { Card } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './AnalyticsScreen.css';

interface AnalyticsData {
  totalCases: number;
  activeCases: number;
  matchesFound: number;
  closedCases: number;
  totalUsers: number;
  totalOfficers: number;
  casesByStatus: {
    submitted: number;
    underVerification: number;
    faceDetectionActive: number;
    matchFound: number;
    closed: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    date: string;
  }>;
}

const AnalyticsScreen: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_STATISTICS);
      console.log('Analytics API Response:', response.data);
      
      if (response.data) {
        const data = response.data;
        // Use the data directly from backend
        setAnalytics({
          totalCases: parseInt(data.totalCases) || 0,
          activeCases: parseInt(data.activeCases) || 0,
          matchesFound: parseInt(data.matchesFound) || 0,
          closedCases: parseInt(data.closedCases) || 0,
          totalUsers: parseInt(data.totalUsers) || 0,
          totalOfficers: parseInt(data.totalOfficers) || 0,
          casesByStatus: {
            submitted: parseInt(data.submitted) || 0,
            underVerification: parseInt(data.underVerification) || 0,
            faceDetectionActive: parseInt(data.faceDetectionActive) || 0,
            matchFound: parseInt(data.matchFound) || 0,
            closed: parseInt(data.closed) || 0,
          },
          recentActivity: [],
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-container">
        <Card className="error-card">
          <p>Failed to load analytics data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">System statistics and performance metrics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-overview">
        <Card className="stat-card-large">
          <div className="stat-icon-large">📊</div>
          <div className="stat-content-large">
            <h3 className="stat-label-large">Total Cases</h3>
            <p className="stat-value-large">{analytics.totalCases}</p>
            <p className="stat-description">All reported missing person cases</p>
          </div>
        </Card>

        <Card className="stat-card-large">
          <div className="stat-icon-large">🔍</div>
          <div className="stat-content-large">
            <h3 className="stat-label-large">Active Cases</h3>
            <p className="stat-value-large">{analytics.activeCases}</p>
            <p className="stat-description">Currently under investigation</p>
          </div>
        </Card>

        <Card className="stat-card-large">
          <div className="stat-icon-large">✅</div>
          <div className="stat-content-large">
            <h3 className="stat-label-large">Matches Found</h3>
            <p className="stat-value-large">{analytics.matchesFound}</p>
            <p className="stat-description">Successful face recognition matches</p>
          </div>
        </Card>

        <Card className="stat-card-large">
          <div className="stat-icon-large">🔒</div>
          <div className="stat-content-large">
            <h3 className="stat-label-large">Closed Cases</h3>
            <p className="stat-value-large">{analytics.closedCases}</p>
            <p className="stat-description">Resolved and closed cases</p>
          </div>
        </Card>
      </div>

      {/* Cases by Status */}
      <div className="analytics-section">
        <h2 className="section-title">Cases by Status</h2>
        <Card className="status-breakdown-card">
          <div className="status-breakdown">
            <div className="status-item">
              <div className="status-header">
                <span className="status-name">Submitted</span>
                <span className="status-count">{analytics.casesByStatus.submitted}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${calculatePercentage(analytics.casesByStatus.submitted, analytics.totalCases)}%`,
                    background: '#3498DB',
                  }}
                />
              </div>
              <span className="status-percentage">
                {calculatePercentage(analytics.casesByStatus.submitted, analytics.totalCases)}%
              </span>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-name">Under Verification</span>
                <span className="status-count">{analytics.casesByStatus.underVerification}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${calculatePercentage(analytics.casesByStatus.underVerification, analytics.totalCases)}%`,
                    background: '#F4A261',
                  }}
                />
              </div>
              <span className="status-percentage">
                {calculatePercentage(analytics.casesByStatus.underVerification, analytics.totalCases)}%
              </span>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-name">Detection Active</span>
                <span className="status-count">{analytics.casesByStatus.faceDetectionActive}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${calculatePercentage(analytics.casesByStatus.faceDetectionActive, analytics.totalCases)}%`,
                    background: '#1ABC9C',
                  }}
                />
              </div>
              <span className="status-percentage">
                {calculatePercentage(analytics.casesByStatus.faceDetectionActive, analytics.totalCases)}%
              </span>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-name">Match Found</span>
                <span className="status-count">{analytics.casesByStatus.matchFound}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${calculatePercentage(analytics.casesByStatus.matchFound, analytics.totalCases)}%`,
                    background: '#2ECC71',
                  }}
                />
              </div>
              <span className="status-percentage">
                {calculatePercentage(analytics.casesByStatus.matchFound, analytics.totalCases)}%
              </span>
            </div>

            <div className="status-item">
              <div className="status-header">
                <span className="status-name">Closed</span>
                <span className="status-count">{analytics.casesByStatus.closed}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${calculatePercentage(analytics.casesByStatus.closed, analytics.totalCases)}%`,
                    background: '#95A5A6',
                  }}
                />
              </div>
              <span className="status-percentage">
                {calculatePercentage(analytics.casesByStatus.closed, analytics.totalCases)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* User & Officer Stats */}
      <div className="analytics-grid">
        <Card className="analytics-card">
          <h3 className="card-title">User Statistics</h3>
          <div className="metric-item">
            <span className="metric-label">Total Registered Users</span>
            <span className="metric-value">{analytics.totalUsers}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Active Users</span>
            <span className="metric-value">{analytics.totalUsers}</span>
          </div>
        </Card>

        <Card className="analytics-card">
          <h3 className="card-title">Officer Statistics</h3>
          <div className="metric-item">
            <span className="metric-label">Total Officers</span>
            <span className="metric-value">{analytics.totalOfficers}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Active Officers</span>
            <span className="metric-value">{analytics.totalOfficers}</span>
          </div>
        </Card>

        <Card className="analytics-card">
          <h3 className="card-title">Case Performance</h3>
          <div className="metric-item">
            <span className="metric-label">Success Rate</span>
            <span className="metric-value">
              {calculatePercentage(analytics.matchesFound, analytics.totalCases)}%
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Resolution Rate</span>
            <span className="metric-value">
              {calculatePercentage(analytics.closedCases, analytics.totalCases)}%
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
