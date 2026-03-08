import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { api, API_ENDPOINTS } from '../../config/api';
import './ManageUsersScreen.css';

interface User {
  id: number;
  username: string;
  email: string;
  number: string;
  created_at: string;
}

const ManageUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '', number: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.number.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.GET_ALL_USERS);
      if (response.data?.data) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await api.delete(`${API_ENDPOINTS.DELETE_USER}/${userId}`);
        alert('User deleted successfully');
        fetchUsers();
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      number: user.number,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    if (!editForm.username || !editForm.email || !editForm.number) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await api.put(`${API_ENDPOINTS.UPDATE_USER}/${selectedUser.id}`, editForm);
      alert('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.error || 'Failed to update user');
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
      <div className="manage-users-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">View and manage all registered users</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{users.length}</span>
          </div>
        </div>
      </div>

      <Card className="search-card">
        <Input
          label="Search Users"
          placeholder="Search by name, email, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {filteredUsers.length === 0 ? (
        <Card className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Users Found</h3>
          <p>{searchTerm ? 'Try adjusting your search terms' : 'No users registered yet'}</p>
        </Card>
      ) : (
        <div className="users-table-container">
          <Card className="table-card">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td className="username-cell">{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.number || 'N/A'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          title="Edit"
                          onClick={() => handleEdit(user)}
                          variant="secondary"
                          className="action-btn"
                        />
                        <Button
                          title="Delete"
                          onClick={() => handleDelete(user.id, user.username)}
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

      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit User</h2>
            <div className="modal-form">
              <Input
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
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
                label="Phone Number"
                type="tel"
                value={editForm.number}
                onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                required
              />
              <div className="modal-actions">
                <Button
                  title="Cancel"
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                />
                <Button
                  title="Update User"
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

export default ManageUsersScreen;
