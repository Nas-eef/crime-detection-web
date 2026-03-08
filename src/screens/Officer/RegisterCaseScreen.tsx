import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './RegisterCaseScreen.css';

const OfficerRegisterCase: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    dateTime: '',
    identificationMarks: '',
    additionalNotes: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.lastSeenLocation || !formData.dateTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      if (formData.age) submitFormData.append('age', formData.age);
      if (formData.gender) submitFormData.append('gender', formData.gender);
      submitFormData.append('last_seen_location', formData.lastSeenLocation);
      submitFormData.append('date_time', formData.dateTime);
      if (formData.identificationMarks) submitFormData.append('identification_marks', formData.identificationMarks);
      if (formData.additionalNotes) submitFormData.append('additional_notes', formData.additionalNotes);

      images.forEach((image) => {
        submitFormData.append('images', image);
      });

      const response = await api.post(API_ENDPOINTS.REGISTER_MISSING_PERSON, submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setLoading(false);
      alert(response.data.message || 'Case registered successfully!');
      navigate('/officer/cases');
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        setError(error.response.data?.error || error.response.data?.message || 'Failed to register case');
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <div className="register-case-container">
      <Card className="register-case-card">
        <div className="register-case-header">
          <h1 className="register-case-title">Register Missing Person Case</h1>
          <p className="register-case-subtitle">Enter case details and upload images</p>
        </div>

        <form onSubmit={handleSubmit} className="register-case-form">
          {error && <div className="error-message">{error}</div>}

          <Input
            label="Full Name *"
            placeholder="Enter missing person's name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-row">
            <Input
              label="Age"
              placeholder="Age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />

            <div className="input-container">
              <label className="input-label">Gender</label>
              <div className="dropdown-wrapper">
                <button
                  type="button"
                  className={`dropdown-button ${formData.gender ? 'has-value' : ''}`}
                  onClick={() => setGenderDropdownVisible(!genderDropdownVisible)}
                >
                  {formData.gender || 'Select Gender'}
                </button>
                {genderDropdownVisible && (
                  <div className="dropdown-menu">
                    {genderOptions.map((option) => (
                      <div
                        key={option}
                        className="dropdown-item"
                        onClick={() => {
                          setFormData({ ...formData, gender: option });
                          setGenderDropdownVisible(false);
                        }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Input
            label="Last Seen Location *"
            placeholder="Enter last seen location"
            value={formData.lastSeenLocation}
            onChange={(e) => setFormData({ ...formData, lastSeenLocation: e.target.value })}
            required
          />

          <Input
            label="Date & Time Last Seen *"
            placeholder="YYYY-MM-DD HH:MM"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />

          <Input
            label="Identification Marks"
            placeholder="Scars, tattoos, etc."
            value={formData.identificationMarks}
            onChange={(e) => setFormData({ ...formData, identificationMarks: e.target.value })}
          />

          <div className="input-container">
            <label className="input-label">Additional Notes</label>
            <textarea
              className="input textarea"
              placeholder="Enter any additional information"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows={4}
            />
          </div>

          <div className="input-container">
            <label className="input-label">Images * (Up to 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="file-input"
            />
            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button
              title="Cancel"
              onClick={() => navigate('/officer/cases')}
              variant="secondary"
              type="button"
            />
            <Button
              title={loading ? 'Registering...' : 'Register Case'}
              onClick={handleSubmit}
              loading={loading}
              type="submit"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OfficerRegisterCase;
