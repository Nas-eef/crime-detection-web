import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './ManageOfficersScreen.css';

interface Officer {
  id: number;
  name: string;
  email: string;
  badge_number: string;
  created_at: string;
}

const ManageOfficersScreen: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', badge_number: '' });

  useEffect(() => {
    fetchOfficers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = officers.filter(
        (officer) =>
          officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          officer.badge_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOfficers(filtered);
    } else {
      setFilteredOfficers(officers);
    }
  }, [searchTerm, officers]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_ALL_OFFICERS);
      if (response.data?.data) {
        setOfficers(response.data.data);
        setFilteredOfficers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
      alert('Failed to fetch officers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (officerId: number, officerName: string) => {
    if (window.confirm(`Are you sure you want to delete officer "${officerName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`${API_ENDPOINTS.DELETE_OFFICER}/${officerId}`);
        alert('Officer deleted successfully');
        fetchOfficers();
      } catch (error: any) {
        console.error('Error deleting officer:', error);
        alert(error.response?.data?.error || 'Failed to delete officer');
      }
    }
  };

  const handleEdit = (officer: Officer) => {
    setSelectedOfficer(officer);
    setEditForm({
      name: officer.name,
      email: officer.email,
      badge_number: officer.badge_number,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedOfficer) return;

    if (!editForm.name || !editForm.email || !editForm.badge_number) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await api.put(`${API_ENDPOINTS.UPDATE_OFFICER}/${selectedOfficer.id}`, editForm);
      alert('Officer updated successfully');
      setShowEditModal(false);
      setSelectedOfficer(null);
      fetchOfficers();
    } catch (error: any) {
      console.error('Error updating officer:', error);
      alert(error.response?.data?.error || 'Failed to update officer');
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

  if (loading) {
    return (
      <div className="manage-officers-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading officers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-officers-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Officers</h1>
          <p className="page-subtitle">View and manage all officer accounts</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-label">Total Officers</span>
            <span className="stat-value">{officers.length}</span>
          </div>
        </div>
      </div>

      <Card className="search-card">
        <Input
          label="Search Officers"
          placeholder="Search by name, email, or badge number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {filteredOfficers.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-icon">👮</div>
          <h3>No Officers Found</h3>
          <p>{searchTerm ? 'Try adjusting your search terms' : 'No officers registered yet'}</p>
        </Card>
      ) : (
        <div className="officers-table-container">
          <Card className="table-card">
            <table className="officers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Badge Number</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id}>
                    <td>#{officer.id}</td>
                    <td className="name-cell">{officer.name}</td>
                    <td>{officer.email}</td>
                    <td className="badge-cell">{officer.badge_number}</td>
                    <td>{formatDate(officer.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          title="Edit"
                          onClick={() => handleEdit(officer)}
                          variant="secondary"
                          className="action-btn"
                        />
                        <Button
                          title="Delete"
                          onClick={() => handleDelete(officer.id, officer.name)}
                          variant="danger"
                          className="action-btn"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {showEditModal && selectedOfficer && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <Card className="modal-content" onClick={(e?: React.MouseEvent<HTMLDivElement>) => e?.stopPropagation()}>
            <h2 className="modal-title">Edit Officer</h2>
            <div className="modal-form">
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
              <Input
                label="Badge Number"
                value={editForm.badge_number}
                onChange={(e) => setEditForm({ ...editForm, badge_number: e.target.value })}
                required
              />
              <div className="modal-actions">
                <Button
                  title="Cancel"
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                />
                <Button
                  title="Update Officer"
                  onClick={handleUpdate}
                  variant="primary"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageOfficersScreen;
