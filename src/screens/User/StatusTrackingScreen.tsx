import React, { useState, useEffect } from 'react';
import { Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import './StatusTrackingScreen.css';

interface Report {
  id: number;
  name: string;
  created_at: string;
  status: string;
  last_seen_location: string;
  date_time?: string;
  primary_image?: string;
}

const StatusTrackingScreen: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GET_USER_REPORTS}/${user?.id}`);
      if (response.data?.data) {
        setReports(response.data.data);
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

  if (loading) {
    return <div className="status-container">Loading...</div>;
  }

  return (
    <div className="status-container">
      <h1 className="status-title">My Reports</h1>
      {reports.length === 0 ? (
        <Card>
          <p>No reports found. Submit a report to track its status.</p>
        </Card>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <Card key={report.id} className="report-card">
              <div className="report-header">
                <h3>{report.name}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(report.status) }}>
                  {report.status}
                </span>
              </div>
              <p className="report-location">📍 {report.last_seen_location}</p>
              <p className="report-date">📅 {new Date(report.created_at).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusTrackingScreen;
