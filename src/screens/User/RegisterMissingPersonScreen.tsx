import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { api, API_ENDPOINTS } from '../../config/api';
import './RegisterMissingPersonScreen.css';

const RegisterMissingPersonScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [processingImage, setProcessingImage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    targetAge: '',
    gender: '',
    lastSeenLocation: '',
    dateTime: '',
    identificationMarks: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const genderOptions = ['Male', 'Female', 'Other'];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImages(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleEnhanceImage = async (index: number) => {
    if (!images[index]) return;
    setProcessingImage(index);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', images[index]);
      const response = await fetch(`${api.defaults.baseURL}${API_ENDPOINTS.GAN_ENHANCE_FACE}`, {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        alert('Image enhanced and stored in database');
      }
    } catch (error) {
      console.error('Error enhancing image:', error);
      alert('Failed to enhance image');
    } finally {
      setProcessingImage(null);
    }
  };

  const handleRestoreFace = async (index: number) => {
    if (!images[index]) return;
    setProcessingImage(index);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', images[index]);
      const response = await fetch(`${api.defaults.baseURL}${API_ENDPOINTS.GAN_RESTORE_FACE}`, {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        alert('Face restored and stored in database');
      }
    } catch (error) {
      console.error('Error restoring face:', error);
      alert('Failed to restore face');
    } finally {
      setProcessingImage(null);
    }
  };

  const handleAgeProgression = async (index: number) => {
    if (!images[index] || !formData.age || !formData.targetAge) {
      alert('Please enter both Current Age and Target Age');
      return;
    }
    setProcessingImage(index);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', images[index]);
      formDataToSend.append('targetAge', formData.targetAge);
      formDataToSend.append('originalAge', formData.age);
      const response = await fetch(`${api.defaults.baseURL}${API_ENDPOINTS.GAN_AGE_FACE}`, {
        method: 'POST',
        body: formDataToSend,
      });
      const result = await response.json();
      if (result.success) {
        alert('Age progression generated and stored in database');
      }
    } catch (error) {
      console.error('Error in age progression:', error);
      alert('Failed to generate age progression');
    } finally {
      setProcessingImage(null);
    }
  };

  const handleNext = () => {
    if (step === 1 && images.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    if (step === 2) {
      if (!formData.name || !formData.age || !formData.gender) {
        alert('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.lastSeenLocation || !formData.dateTime || images.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', images[0]);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('lastSeenLocation', formData.lastSeenLocation);
      formDataToSend.append('dateTime', formData.dateTime);
      if (user?.id) formDataToSend.append('reporterId', user.id.toString());
      if (formData.identificationMarks) formDataToSend.append('identificationMarks', formData.identificationMarks);
      if (formData.additionalNotes) formDataToSend.append('additionalNotes', formData.additionalNotes);

      const response = await api.post(API_ENDPOINTS.REGISTER_MISSING_PERSON, formDataToSend);
      alert(response.data.message || 'Report submitted successfully!');
      navigate('/user/status');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-missing-container">
      <div className="register-missing-content">
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        <Card className="register-missing-card">
          {step === 1 && (
            <div>
              <h2 className="step-title">Step 1: Upload Images</h2>
              <p className="step-subtitle">Upload clear face images (max 800x800px)</p>
              
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="image-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="image-picker">
                + Add Images (Max 5)
              </label>

              {imagePreviews.length > 0 && (
                <div className="image-container">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-card">
                      <div className="image-wrapper">
                        <img src={preview} alt={`Preview ${index}`} className="image" />
                        <button className="remove-button" onClick={() => removeImage(index)}>×</button>
                      </div>
                      <div className="gan-buttons">
                        <Button
                          title={processingImage === index ? 'Processing...' : '✨ Enhance'}
                          onClick={() => handleEnhanceImage(index)}
                          disabled={processingImage === index}
                          className="gan-button"
                        />
                        <Button
                          title="🔧 Restore"
                          onClick={() => handleRestoreFace(index)}
                          disabled={processingImage === index}
                          className="gan-button"
                        />
                        <Button
                          title="⏳ Age Progress"
                          onClick={() => handleAgeProgression(index)}
                          disabled={processingImage === index || !formData.age || !formData.targetAge}
                          className="gan-button"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <div className="age-input-container">
                  <div className="age-input-row">
                    <Input
                      label="Current Age"
                      placeholder="e.g., 25"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      type="number"
                    />
                    <Input
                      label="Target Age"
                      placeholder="e.g., 30"
                      value={formData.targetAge}
                      onChange={(e) => setFormData({ ...formData, targetAge: e.target.value })}
                      type="number"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="step-title">Step 2: Personal Details</h2>
              <Input
                label="Name *"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Age *"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                type="number"
              />
              <div className="dropdown-container">
                <label className="input-label">Gender *</label>
                <div className="dropdown" onClick={() => setGenderDropdownVisible(!genderDropdownVisible)}>
                  <span className={!formData.gender ? 'dropdown-placeholder' : ''}>
                    {formData.gender || 'Select Gender'}
                  </span>
                  <span>▼</span>
                </div>
                {genderDropdownVisible && (
                  <div className="dropdown-menu">
                    {genderOptions.map(option => (
                      <div
                        key={option}
                        className="dropdown-option"
                        onClick={() => {
                          setFormData({ ...formData, gender: option });
                          setGenderDropdownVisible(false);
                        }}>
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Input
                label="Identification Marks"
                placeholder="Scars, tattoos, etc."
                value={formData.identificationMarks}
                onChange={(e) => setFormData({ ...formData, identificationMarks: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="step-title">Step 3: Last Seen Information</h2>
              <Input
                label="Last Seen Location *"
                placeholder="Enter location"
                value={formData.lastSeenLocation}
                onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
              />
              <Input
                label="Date & Time *"
                placeholder="Enter date and time"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              />
              <Input
                label="Additional Notes"
                placeholder="Any other relevant information"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              />
            </div>
          )}

          <div className="button-container">
            {step > 1 && (
              <Button title="Previous" onClick={() => setStep(step - 1)} variant="secondary" />
            )}
            {step < 3 ? (
              <Button title="Next" onClick={handleNext} />
            ) : (
              <Button title="Submit Report" onClick={handleSubmit} loading={loading} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterMissingPersonScreen;
