// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Define all styles at the top of the component, before they're used
  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const photoStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '30px',
    border: '3px solid #dc3545'
  };

  const nameStyle = {
    fontSize: '32px',
    color: '#333',
    marginBottom: '5px'
  };

  const bloodTypeStyle = {
    fontSize: '24px',
    color: '#dc3545',
    fontWeight: 'bold',
    marginBottom: '10px'
  };

  const sectionStyle = {
    marginBottom: '30px',
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    color: '#dc3545',
    marginBottom: '15px',
    borderBottom: '2px solid #dc3545',
    paddingBottom: '5px'
  };

  const infoRowStyle = {
    display: 'flex',
    marginBottom: '10px',
    flexWrap: 'wrap'
  };

  const infoLabelStyle = {
    fontWeight: 'bold',
    width: '200px',
    color: '#333'
  };

  const infoValueStyle = {
    flex: '1',
    minWidth: '200px'
  };

  const loadingStyle = {
    padding: '20px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#666'
  };

  const errorStyle = {
    padding: '20px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderRadius: '4px'
  };

  const buttonStyle = {
    padding: '10px 15px',
    margin: '0 10px 10px 0',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '5px 0',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '100px'
  };

  const confirmModalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '80%'
  };

  const modalButtonsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        setProfile(response.data.profile);
        setEditedProfile(response.data.profile);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditedProfile(profile);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/profile/${userId}`, editedProfile);
      setProfile(response.data.profile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/profile/${userId}`);
      alert('Profile deleted successfully!');
      // Redirect to home page or login page after deletion
      navigate('/');
    } catch (err) {
      console.error('Error deleting profile:', err);
      alert('Failed to delete profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading profile information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>Profile not found.</div>
      </div>
    );
  }

  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : '';

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', color: '#dc3545', marginBottom: '30px' }}>
        BloodLink Donor Profile
      </h1>
      
      {!isEditing ? (
        <>
          <div style={headerStyle}>
            <img 
              src={profile.photoUrl ? `http://localhost:5000${profile.photoUrl}` : 'https://via.placeholder.com/150'} 
              alt={profile.fullName} 
              style={photoStyle} 
            />
            <div>
              <h2 style={nameStyle}>{profile.fullName}</h2>
              <div style={bloodTypeStyle}>Blood Type: {profile.bloodType}</div>
              <div>{profile.gender}, {age} years old</div>
            </div>
          </div>
          
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Contact Information</h3>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Email:</span>
              <span style={infoValueStyle}>{profile.email}</span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Phone Number:</span>
              <span style={infoValueStyle}>{profile.phoneNumber}</span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Address:</span>
              <span style={infoValueStyle}>{profile.address}</span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Emergency Contact:</span>
              <span style={infoValueStyle}>{profile.emergencyContact}</span>
            </div>
          </div>
          
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Health Information</h3>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Medical Conditions:</span>
              <span style={infoValueStyle}>
                {profile.medicalConditions ? profile.medicalConditions : 'None specified'}
              </span>
            </div>
            
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>Medications:</span>
              <span style={infoValueStyle}>
                {profile.medications ? profile.medications : 'None specified'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: '20px' }}>
            <button style={buttonStyle} onClick={handleEditToggle}>Edit Profile</button>
            <button style={deleteButtonStyle} onClick={() => setShowDeleteConfirm(true)}>Delete Profile</button>
          </div>
        </>
      ) : (
        // Edit Form
        <>
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Edit Profile</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Full Name:</label>
              <input
                type="text"
                name="fullName"
                value={editedProfile.fullName}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Blood Type:</label>
              <select
                name="bloodType"
                value={editedProfile.bloodType}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Gender:</label>
              <select
                name="gender"
                value={editedProfile.gender}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={editedProfile.dateOfBirth ? editedProfile.dateOfBirth.substring(0, 10) : ''}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Email:</label>
              <input
                type="email"
                name="email"
                value={editedProfile.email}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Phone Number:</label>
              <input
                type="tel"
                name="phoneNumber"
                value={editedProfile.phoneNumber}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Address:</label>
              <textarea
                name="address"
                value={editedProfile.address}
                onChange={handleInputChange}
                style={textareaStyle}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Emergency Contact:</label>
              <input
                type="text"
                name="emergencyContact"
                value={editedProfile.emergencyContact}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Medical Conditions:</label>
              <textarea
                name="medicalConditions"
                value={editedProfile.medicalConditions || ''}
                onChange={handleInputChange}
                style={textareaStyle}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={infoLabelStyle}>Medications:</label>
              <textarea
                name="medications"
                value={editedProfile.medications || ''}
                onChange={handleInputChange}
                style={textareaStyle}
              />
            </div>

            <div style={{ display: 'flex', marginTop: '20px' }}>
              <button style={buttonStyle} onClick={handleSaveChanges}>Save Changes</button>
              <button style={cancelButtonStyle} onClick={handleEditToggle}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={confirmModalStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ color: '#dc3545' }}>Confirm Deletion</h3>
            <p>Are you sure you want to delete your profile? This action cannot be undone.</p>
            
            <div style={modalButtonsStyle}>
              <button style={cancelButtonStyle} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button style={deleteButtonStyle} onClick={handleDeleteProfile}>Delete Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;