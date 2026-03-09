import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './CaseHandlingScreen.css';

interface Case {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;
  last_seen_location: string;
  date_time: string;
  status: 'submitted' | 'underVerification' | 'faceDetectionActive' | 'matchFound' | 'closed';
  created_at: string;
  primary_image?: string;
  reporter_name?: string;
  officer_name?: string;
  identification_marks?: string;
  additional_notes?: string;
}

const CaseHandlingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_ALL_MISSING_PERSONS);
      if (response.data?.data) {
        setCases(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching cases:', error);
      alert(error.response?.data?.error || 'Failed to load cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (newStatus: Case['status']) => {
    if (!selectedCase) return;

    try {
      setUpdating(true);
      const response = await api.put(
        `${API_ENDPOINTS.UPDATE_MISSING_PERSON_STATUS}/${selectedCase.id}/status`,
        { status: newStatus }
      );

      if (response.status >= 200 && response.status < 300) {
        const updatedCase = { ...selectedCase, status: newStatus };
        setSelectedCase(updatedCase);
        setCases(cases.map(c => c.id === selectedCase.id ? updatedCase : c));
        alert('Case status updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating case status:', error);
      alert(error.response?.data?.error || 'Failed to update case status');
    } finally {
      setUpdating(false);
    }
  };

  const startLiveDetection = (caseInfo?: Case) => {
    const caseData = caseInfo || selectedCase;
    if (caseData) {
      navigate('/officer/live-detection', {
        state: {
          caseInfo: {
            id: caseData.id,
            name: caseData.name,
            primary_image: caseData.primary_image,
          },
          specificCaseOnly: true,
        },
      });
    } else {
      navigate('/officer/live-detection');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCaseNumber = (id: number) => {
    return `CASE-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`;
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

  if (loading && cases.length === 0) {
    return (
      <div className="case-handling-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="case-handling-container">
      {!selectedCase ? (
        <div>
          <div className="case-header">
            <h1 className="case-handling-title">Missing Person Cases</h1>
            <div className="header-actions">
              <Button
                title="Register New Case"
                onClick={() => navigate('/officer/register-case')}
                variant="secondary"
                className="register-case-button"
              />
              <Button
                title="Start Live Detection"
                onClick={() => startLiveDetection()}
                className="detection-button"
              />
            </div>
          </div>

          {cases.length === 0 ? (
            <Card>
              <p className="empty-text">No cases found. Pull down to refresh.</p>
            </Card>
          ) : (
            <div className="cases-list">
              {cases.map((caseItem) => (
                <Card key={caseItem.id} className="case-card" onClick={() => setSelectedCase(caseItem)}>
                  <div className="case-card-header">
                    <div className="case-info">
                      <span className="case-number">{formatCaseNumber(caseItem.id)}</span>
                      <h3 className="case-name">{caseItem.name}</h3>
                      {caseItem.age && (
                        <p className="case-age">
                          {caseItem.age} years old • {caseItem.gender || 'N/A'}
                        </p>
                      )}
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(caseItem.status) }}>
                      {caseItem.status}
                    </span>
                  </div>

                  {caseItem.primary_image && (
                    <img
                      src={`${api.defaults.baseURL}/${caseItem.primary_image}`}
                      alt={caseItem.name}
                      className="case-image"
                    />
                  )}

                  <div className="case-details">
                    <p>📍 {caseItem.last_seen_location}</p>
                    <p>📅 {formatDate(caseItem.date_time || caseItem.created_at)}</p>
                    {caseItem.reporter_name && <p>👤 Reported by: {caseItem.reporter_name}</p>}
                  </div>

                  <div className="card-actions">
                    <Button
                      title="View Details →"
                      onClick={() => setSelectedCase(caseItem)}
                      variant="secondary"
                    />
                    {caseItem.status !== 'closed' && (
                      <Button
                        title="Start Detection"
                        onClick={() => {
                          startLiveDetection(caseItem);
                        }}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <button className="back-button" onClick={() => setSelectedCase(null)}>
            ← Back to Cases
          </button>

          <Card className="detail-card">
            <div className="case-header-detail">
              <div>
                <span className="case-number">{formatCaseNumber(selectedCase.id)}</span>
                <h2 className="case-name">{selectedCase.name}</h2>
              </div>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedCase.status) }}>
                {selectedCase.status}
              </span>
            </div>

            {selectedCase.primary_image && (
              <img
                src={`${api.defaults.baseURL}/${selectedCase.primary_image}`}
                alt={selectedCase.name}
                className="detail-image"
              />
            )}

            <div className="detail-section">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{selectedCase.age || 'Not specified'}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{selectedCase.gender || 'Not specified'}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Last Seen Location:</span>
              <span className="detail-value">{selectedCase.last_seen_location}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Last Seen Date & Time:</span>
              <span className="detail-value">{selectedCase.date_time || 'Not specified'}</span>
            </div>

            <div className="detail-section">
              <span className="detail-label">Date Reported:</span>
              <span className="detail-value">{formatDate(selectedCase.created_at)}</span>
            </div>

            {selectedCase.identification_marks && (
              <div className="detail-section">
                <span className="detail-label">Identification Marks:</span>
                <span className="detail-value">{selectedCase.identification_marks}</span>
              </div>
            )}

            {selectedCase.additional_notes && (
              <div className="detail-section">
                <span className="detail-label">Additional Notes:</span>
                <span className="detail-value">{selectedCase.additional_notes}</span>
              </div>
            )}

            {selectedCase.reporter_name && (
              <div className="detail-section">
                <span className="detail-label">Reported By:</span>
                <span className="detail-value">{selectedCase.reporter_name}</span>
              </div>
            )}
          </Card>

          <Card className="status-update-card">
            <h3 className="section-title">Update Case Status</h3>
            {selectedCase.status === 'closed' ? (
              <div className="closed-case-container">
                <p>✓ This case has been closed. Status updates are no longer available.</p>
              </div>
            ) : (
              <div className="status-buttons">
                <Button
                  title="Under Verification"
                  onClick={() => updateCaseStatus('underVerification')}
                  variant="secondary"
                  disabled={updating}
                  loading={updating}
                />
                <Button
                  title="Face Detection Active"
                  onClick={() => updateCaseStatus('faceDetectionActive')}
                  variant="secondary"
                  disabled={updating}
                  loading={updating}
                />
                <Button
                  title="Match Found"
                  onClick={() => updateCaseStatus('matchFound')}
                  variant="success"
                  disabled={updating}
                  loading={updating}
                />
                <Button
                  title="Close Case"
                  onClick={() => updateCaseStatus('closed')}
                  variant="danger"
                  disabled={updating}
                  loading={updating}
                />
              </div>
            )}
          </Card>

          {selectedCase.status !== 'closed' && (
            <Card>
              <h3 className="section-title">Start Live Detection</h3>
              <p className="section-subtitle">Use live face detection to search for {selectedCase.name}</p>
              <Button
                title="Start Detection for This Person"
                onClick={() => startLiveDetection(selectedCase)}
                className="detection-button"
              />
            </Card>
          )}

          <Card>
            <h3 className="section-title">Officer Remarks</h3>
            <Input
              placeholder="Add remarks or notes about this case..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="remarks-input"
            />
            <Button
              title="Save Remarks"
              onClick={() => alert('Remarks feature coming soon')}
              variant="secondary"
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default CaseHandlingScreen;
