import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './LiveDetectionScreen.css';

interface Match {
  id: number;
  name: string;
  confidence: number;
  timestamp: string;
  status: 'missing';
  caseId?: number;
}

interface CaseInfo {
  id: number;
  name: string;
  primary_image?: string;
}

const LiveDetectionScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [webcamStreamUrl, setWebcamStreamUrl] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentCase] = useState<CaseInfo | null>(
    (location.state as any)?.caseInfo || null
  );
  const [specificCaseOnly] = useState<boolean>(
    (location.state as any)?.specificCaseOnly || false
  );
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [matchFoundModalVisible, setMatchFoundModalVisible] = useState(false);
  const [matchSaved, setMatchSaved] = useState(false);
  const [streamKey, setStreamKey] = useState<number>(0);
  const [faceBoxes, setFaceBoxes] = useState<Array<{
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>>([]);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const captureIntervalRef = useRef<number | null>(null);
  const streamRefreshIntervalRef = useRef<number | null>(null);
  const lastProcessTimeRef = useRef<number>(0);

  useEffect(() => {
    initializeWebcamStream();
    // Auto-start streaming if case info is provided
    if (currentCase) {
      setIsStreaming(true);
    }
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      if (streamRefreshIntervalRef.current) {
        clearInterval(streamRefreshIntervalRef.current);
        streamRefreshIntervalRef.current = null;
      }
    };
  }, []);

  // Auto-start when case changes
  useEffect(() => {
    if (currentCase && !isStreaming) {
      setIsStreaming(true);
    }
  }, [currentCase]);

  useEffect(() => {
    if (isStreaming && webcamStreamUrl) {
      console.log('🔄 Starting live detection stream...');
      
      // Start capturing frames every 8 seconds for face recognition with Gemini
      // Reduced frequency to avoid rate limits
      captureIntervalRef.current = setInterval(() => {
        captureAndProcess();
      }, 8000);

      // Refresh stream image every 200ms for smooth live display
      // This updates the Image component's key and timestamp to force refresh
      streamRefreshIntervalRef.current = setInterval(() => {
        const newKey = Date.now();
        setStreamKey(newKey);
      }, 200);
    } else {
      console.log('⏸️ Stopping live detection stream...');
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      if (streamRefreshIntervalRef.current) {
        clearInterval(streamRefreshIntervalRef.current);
        streamRefreshIntervalRef.current = null;
      }
    }
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      if (streamRefreshIntervalRef.current) {
        clearInterval(streamRefreshIntervalRef.current);
        streamRefreshIntervalRef.current = null;
      }
    };
  }, [isStreaming, webcamStreamUrl]);

  const initializeWebcamStream = async () => {
    try {
      // Try to get stream URL from backend
      try {
        const response = await api.get(API_ENDPOINTS.WEBCAM_STREAM);
        if (response.data?.streamUrl) {
          let streamUrl = response.data.streamUrl;
          if (streamUrl.startsWith('http://') || streamUrl.startsWith('https://')) {
            const urlObj = new URL(streamUrl);
            streamUrl = urlObj.pathname;
          }
          streamUrl = `${api.defaults.baseURL}${streamUrl}`.replace('/webcam-capture', '/webcam-frame');
          setWebcamStreamUrl(streamUrl);
          console.log('✅ Webcam stream URL configured:', streamUrl);
          return;
        }
      } catch (streamError) {
        console.log('⚠️ Stream endpoint not available, using frame endpoint directly');
      }
      
      // Fallback: use frame endpoint directly
      const fallbackUrl = `${api.defaults.baseURL}${API_ENDPOINTS.WEBCAM_FRAME}`;
      setWebcamStreamUrl(fallbackUrl);
      console.log('✅ Using frame endpoint for webcam stream:', fallbackUrl);
      
      // Test if the endpoint is accessible
      try {
        const testResponse = await fetch(fallbackUrl, { method: 'HEAD' });
        console.log('✅ Webcam endpoint test:', testResponse.status, testResponse.statusText);
      } catch (testError) {
        console.error('❌ Webcam endpoint test failed:', testError);
      }
    } catch (error) {
      console.error('❌ Error initializing webcam:', error);
      const fallbackUrl = `${api.defaults.baseURL}${API_ENDPOINTS.WEBCAM_FRAME}`;
      setWebcamStreamUrl(fallbackUrl);
      console.log('✅ Using fallback frame endpoint:', fallbackUrl);
    }
  };

  const captureAndProcess = async () => {
    if (processing || !isStreaming) return;

    const now = Date.now();
    if (now - lastProcessTimeRef.current < 7000) return; // Throttle to 7 seconds (for Gemini rate limits)
    lastProcessTimeRef.current = now;

    setProcessing(true);
    setFrameCount(prev => prev + 1);

    try {
      const caseId = (specificCaseOnly && currentCase) ? currentCase.id : undefined;
      const frameUrl = `${api.defaults.baseURL}${API_ENDPOINTS.WEBCAM_FRAME}?t=${Date.now()}`;

      const frameResponse = await fetch(frameUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!frameResponse.ok) throw new Error(`HTTP error! status: ${frameResponse.status}`);

      const imageBlob = await frameResponse.blob();
      if (!imageBlob || imageBlob.size === 0) throw new Error('Empty image blob');

      const formData = new FormData();
      formData.append('image', imageBlob, 'frame.jpg');
      if (caseId) formData.append('caseId', caseId.toString());

      const response = await fetch(`${api.defaults.baseURL}${API_ENDPOINTS.LIVE_DETECTION}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      const confidence = result.confidence || 0;
      setSimilarity(confidence);
      
      // Update face bounding boxes for display
      if (result.faces && Array.isArray(result.faces) && result.faces.length > 0) {
        setFaceBoxes(result.faces);
      } else {
        setFaceBoxes([]);
      }

      if (result.matchFound && result.case) {
        const match: Match = {
          id: result.case.id,
          name: result.case.name,
          confidence: confidence,
          timestamp: new Date().toLocaleTimeString(),
          status: 'missing',
          caseId: result.case.id,
        };

        setCurrentMatch(match);
        const isExactMatch = !specificCaseOnly || (currentCase && match.caseId === currentCase.id);

        // Gemini returns confidence 0-100, threshold is 85% for high confidence match
        if (result.matchFound && confidence >= 85 && isExactMatch) {
          console.log('🎯 HIGH CONFIDENCE MATCH FOUND!', match);
          setIsStreaming(false);
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
          }
          if (!matchSaved) {
            saveMatchToBackend(match, 'webcam_frame.jpg');
          }
          setMatchFoundModalVisible(true);
        }

        // Show matches with confidence >= 70% (Gemini threshold)
        if (confidence >= 70) {
          setMatches((prevMatches: Match[]) => {
            const existingIndex = prevMatches.findIndex((m) => m.id === match.id);
            if (existingIndex >= 0) {
              if (match.confidence > prevMatches[existingIndex].confidence) {
                const updated = [...prevMatches];
                updated[existingIndex] = match;
                return updated;
              }
              return prevMatches;
            }
            return [match, ...prevMatches].slice(0, 10);
          });
        }
      } else {
        setCurrentMatch(null);
        // Clear similarity if no match
        if (confidence < 50) {
          setSimilarity(null);
        }
      }
    } catch (error: any) {
      console.error('Face recognition error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const saveMatchToBackend = async (match: Match, imagePath: string) => {
    if (matchSaved) return;

    try {
      setMatchSaved(true);

      await api.post(API_ENDPOINTS.SAVE_MATCH_RESULT, {
        caseId: match.caseId,
        confidence: match.confidence,
        imagePath: imagePath,
        officerId: null,
      });
    } catch (error: any) {
      console.error('Error saving match:', error);
      alert(error.response?.data?.error || 'Failed to save match result');
      setMatchSaved(false); // Reset on error so user can retry
    }
  };

  const handleRetryDetection = () => {
    setMatchFoundModalVisible(false);
    setCurrentMatch(null);
    setSimilarity(null);
    setMatchSaved(false);
    setIsStreaming(true);
  };

  const handleCloseCase = async () => {
    if (!currentMatch?.caseId) return;
    if (window.confirm('Are you sure you want to close this case?')) {
      try {
        await api.put(`${API_ENDPOINTS.UPDATE_MISSING_PERSON_STATUS}/${currentMatch.caseId}/status`, {
          status: 'closed',
        });
        alert('Case closed successfully');
        navigate('/officer/cases');
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to close case');
      }
    }
  };

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      setMatches([]);
      setCurrentMatch(null);
      setSimilarity(null);
      setMatchSaved(false);
    }
  };

  // Build stream URL with timestamp to prevent caching
  const streamImageUrl = webcamStreamUrl ? `${webcamStreamUrl}` : '';
  
  // Debug: Log stream URL when it changes
  useEffect(() => {
    if (streamImageUrl) {
      console.log('📹 Stream URL set:', streamImageUrl);
    }
  }, [streamImageUrl]);

  return (
    <div className="live-detection-container">
      <div className="live-detection-header">
        <h1 className="live-detection-title">Live Face Detection</h1>
      </div>
      
      {currentCase && (
        <Card className="case-info-card">
          <h3>Detecting: {currentCase.name}</h3>
          <p>Case ID: {currentCase.id}</p>
        </Card>
      )}

      <Card className="video-card">
        <div className="video-wrapper" ref={videoWrapperRef}>
          {isStreaming && streamImageUrl ? (
            <>
              {/* Main webcam image */}
              <img
                ref={imageRef}
                src={`${streamImageUrl}?t=${streamKey}&_=${Date.now()}&nocache=${Math.random()}`}
                alt="Webcam Stream"
                className="webcam-image"
                key={`stream-${streamKey}`}
                crossOrigin="anonymous"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (frameCount % 10 === 0) {
                    console.log('✅ Webcam image loaded successfully');
                    console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                  }
                  img.style.display = 'block';
                  img.style.opacity = '1';
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  console.error('❌ Error loading webcam image');
                  setTimeout(() => {
                    if (img && streamImageUrl) {
                      const newUrl = `${streamImageUrl}?t=${Date.now()}&_=${Date.now()}&nocache=${Math.random()}`;
                      img.src = newUrl;
                    }
                  }, 500);
                }}
              />
              
              {/* Face Detection Bounding Boxes */}
              {faceBoxes.length > 0 && imageRef.current && faceBoxes.map((face, index) => {
                const box = face.boundingBox;
                const img = imageRef.current;
                if (!img) return null;
                
                // Get actual image display dimensions
                const imgRect = img.getBoundingClientRect();
                const imgNaturalWidth = img.naturalWidth;
                const imgNaturalHeight = img.naturalHeight;
                const imgDisplayWidth = imgRect.width;
                const imgDisplayHeight = imgRect.height;
                
                // Calculate scale factors
                const scaleX = imgDisplayWidth / imgNaturalWidth;
                const scaleY = imgDisplayHeight / imgNaturalHeight;
                
                // Convert percentage to actual display pixels
                const x = (box.x / 100) * imgNaturalWidth * scaleX;
                const y = (box.y / 100) * imgNaturalHeight * scaleY;
                const width = (box.width / 100) * imgNaturalWidth * scaleX;
                const height = (box.height / 100) * imgNaturalHeight * scaleY;
                
                return (
                  <div
                    key={`face-${index}-${streamKey}`}
                    className="face-bounding-box"
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      border: '3px solid #00FF00',
                      borderRadius: '4px',
                      pointerEvents: 'none',
                      zIndex: 5,
                      boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="face-label" style={{
                      position: 'absolute',
                      top: '-28px',
                      left: '0',
                      background: 'rgba(0, 255, 0, 0.9)',
                      color: '#000',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      Face {index + 1} ({face.confidence.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
              
              {/* Overlays */}
              {similarity !== null && (
                <div className="similarity-indicator">
                  Similarity: {similarity.toFixed(1)}%
                </div>
              )}
              {isStreaming && (
                <div className="stream-status">
                  <span className="stream-indicator"></span>
                  <span>Live</span>
                </div>
              )}
              {processing && (
                <div className="processing-overlay">
                  <div className="processing-spinner"></div>
                  <p>Processing frame...</p>
                </div>
              )}
              {!processing && isStreaming && (
                <div className="stream-ready-indicator">
                  <span>✓ Stream Active</span>
                </div>
              )}
            </>
          ) : (
            <div className="stream-placeholder">
              {webcamStreamUrl ? 'Click Start to begin live detection' : 'Webcam not available'}
            </div>
          )}
        </div>
        <div className="controls">
          <Button
            title={isStreaming ? 'Stop Detection' : 'Start Detection'}
            onClick={toggleStream}
            variant={isStreaming ? 'danger' : 'success'}
            disabled={!webcamStreamUrl}
          />
          {webcamStreamUrl && (
            <div className="stream-info">
              <p><strong>Stream URL:</strong> {webcamStreamUrl}</p>
              <p><strong>Status:</strong> {isStreaming ? '🟢 Streaming' : '🔴 Stopped'}</p>
              <p><strong>Frame Count:</strong> {frameCount}</p>
              <p><strong>Stream Key:</strong> {streamKey}</p>
              <button 
                onClick={() => {
                  const testUrl = `${webcamStreamUrl}?t=${Date.now()}`;
                  window.open(testUrl, '_blank');
                  console.log('Testing URL in new tab:', testUrl);
                }}
                style={{ 
                  marginTop: '8px', 
                  padding: '4px 8px', 
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                Test URL in New Tab
              </button>
            </div>
          )}
        </div>
      </Card>

      {matches.length > 0 && (
        <Card className="matches-card">
          <h2>Recent Matches</h2>
          <div className="matches-list">
            {matches.map((match, index) => (
              <div key={index} className="match-item">
                <div className="match-info">
                  <strong>{match.name}</strong>
                  <span className="match-confidence">{match.confidence.toFixed(1)}%</span>
                </div>
                <span className="match-time">{match.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {matchFoundModalVisible && currentMatch && (
        <div className="modal-overlay" onClick={() => setMatchFoundModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎯 Match Found!</h2>
            <div className="match-details">
              <p><strong>Name:</strong> {currentMatch.name}</p>
              <p><strong>Confidence:</strong> {currentMatch.confidence.toFixed(1)}%</p>
              <p><strong>Case ID:</strong> {currentMatch.caseId}</p>
            </div>
            <div className="modal-actions">
              <Button title="Retry Detection" onClick={handleRetryDetection} variant="secondary" />
              <Button title="View Case" onClick={() => navigate(`/officer/cases?caseId=${currentMatch.caseId}`)} />
              <Button title="Close Case" onClick={handleCloseCase} variant="danger" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDetectionScreen;
