import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Fixed: Added loading state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const { user, logout } = useAuth();

  // ✅ Fixed: useCallback at top level (not conditional)
  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/students/profile', formData);
      setProfile(formData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    }
  }, [formData]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true); // ✅ Fixed: setLoading is now declared
      const response = await axios.get('/api/students/profile');
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false); // ✅ Fixed: setLoading is now declared
    }
  };

  // ✅ Fixed: loading is now declared
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <h2>Loading your dashboard...</h2>
          <div className="spinner">⏳</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>Profile not found</h2>
          <button onClick={fetchProfile}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="profile-section">
        <h2>My Profile</h2>
        {editMode ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Course:</label>
              <input
                type="text"
                value={formData.course || ''}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
                placeholder="Course"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button 
                type="button" 
                onClick={() => {
                  setEditMode(false);
                  setFormData(profile); // Reset form data
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <strong>Name:</strong> {profile.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {profile.email}
            </div>
            <div className="info-item">
              <strong>Course:</strong> {profile.course}
            </div>
            <div className="info-item">
              <strong>Enrollment Date:</strong> {profile.enrollmentDate}
            </div>
            <button onClick={() => setEditMode(true)} className="edit-btn">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
