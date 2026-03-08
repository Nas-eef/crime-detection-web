import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button } from '../../components';
import { api } from '../../config/api';
import './AlertVerificationScreen.css';

const AlertVerificationScreen: React.FC = () => {
  const location = useLocation();
  const matchData = (location.state as any)?.match || null;
  
  const [match, setMatch] = useState({
    id: matchData?.id || '1',
    name: matchData?.name || 'John Doe',
    confidence: matchData?.confidence || 92.5,
    liveImage: matchData?.liveImage || '',
    databaseImage: matchData?.databaseImage || '',
    details: {
      age: matchData?.details?.age || 35,
      gender: matchData?.details?.gender || 'Male',
      lastSeen: matchData?.details?.lastSeen || '2024-01-15',
      status: matchData?.details?.status || 'Suspect',
      caseNumber: matchData?.details?.caseNumber || 'CASE-2024-001',
    },
  });
  
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const handleAccept = () => {
    setVerificationStatus('accepted');
    // TODO: Send accept to backend
    alert('Match accepted. Case has been updated.');
  };

  const handleReject = () => {
    setVerificationStatus('rejected');
    // TODO: Send reject to backend
    alert('Match rejected. Detection will continue.');
  };

  return (
    <div className="alert-verification-container">
      <Card className="alert-card">
        <div className="alert-header">
          <span className="alert-icon">🚨</span>
          <div>
            <h2 className="alert-title">Match Detected</h2>
            <p className="alert-subtitle">High Confidence Match</p>
          </div>
        </div>
        <div className="confidence-container">
          <p className="confidence-label">Confidence Score</p>
          <p className="confidence-value">{match.confidence}%</p>
        </div>
      </Card>

      <Card className="comparison-card">
        <h3 className="section-title">Image Comparison</h3>
        <div className="image-comparison">
          <div className="image-container">
            <p className="image-label">Live Detection</p>
            {match.liveImage ? (
              <img src={match.liveImage} alt="Live Detection" className="comparison-image" />
            ) : (
              <div className="image-placeholder">
                <p>Live Image</p>
              </div>
            )}
          </div>
          <div className="image-container">
            <p className="image-label">Database</p>
            {match.databaseImage ? (
              <img src={`${api.defaults.baseURL}/${match.databaseImage}`} alt="Database" className="comparison-image" />
            ) : (
              <div className="image-placeholder">
                <p>DB Image</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="details-card">
        <h3 className="section-title">Suspect Details</h3>
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{match.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Age:</span>
          <span className="detail-value">{match.details.age}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Gender:</span>
          <span className="detail-value">{match.details.gender}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="status-badge status-badge-suspect">{match.details.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Case Number:</span>
          <span className="detail-value">{match.details.caseNumber}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Last Seen:</span>
          <span className="detail-value">{match.details.lastSeen}</span>
        </div>
      </Card>

      {verificationStatus === 'pending' ? (
        <div className="action-container">
          <Button
            title="Accept Match"
            onClick={handleAccept}
            variant="success"
            className="action-button"
          />
          <Button
            title="Reject Match"
            onClick={handleReject}
            variant="danger"
            className="action-button"
          />
        </div>
      ) : (
        <Card className={`result-card ${verificationStatus === 'accepted' ? 'accepted' : 'rejected'}`}>
          <p className="result-text">
            Match {verificationStatus === 'accepted' ? 'Accepted' : 'Rejected'}
          </p>
          <p className="result-subtext">
            {verificationStatus === 'accepted'
              ? 'The match has been verified and case has been updated.'
              : 'The match has been rejected. Detection will continue.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AlertVerificationScreen;
