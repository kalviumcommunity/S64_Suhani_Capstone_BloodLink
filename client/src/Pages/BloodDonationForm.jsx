// BloodDonationForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const BloodDonationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
    medicalConditions: '',
    medications: ''
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      
      // Create preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      
      // Append all text form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append photo if exists
      if (photo) {
        formDataToSend.append('photo', photo);
      }
      
      const response = await axios.post('http://localhost:5000/api/create-profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage('Profile created successfully!');
      // Redirect to profile page or clear form
      setTimeout(() => {
        window.location.href = `/profile/${response.data.userId}`;
      }, 2000);
    } catch (error) {
      console.error('Error creating profile:', error);
      setMessage(error.response?.data?.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContainerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const sectionStyle = {
    marginBottom: '20px'
  };

  const formLayoutStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  };

  const columnStyle = {
    flex: '1',
    minWidth: '300px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    marginBottom: '15px'
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    height: '100px',
    resize: 'vertical',
    marginBottom: '15px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  const messageStyle = {
    padding: '10px',
    marginTop: '20px',
    backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
    color: message.includes('success') ? '#155724' : '#721c24',
    borderRadius: '4px',
    textAlign: 'center',
    display: message ? 'block' : 'none'
  };

  const photoUploadStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const photoPreviewStyle = {
    width: '150px',
    height: '150px',
    border: '1px solid #ddd',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '10px',
    display: photoPreview ? 'block' : 'none'
  };

  const photoPlaceholderStyle = {
    width: '150px',
    height: '150px',
    border: '1px solid #ddd',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    fontSize: '14px',
    marginBottom: '10px',
    display: photoPreview ? 'none' : 'flex'
  };

  const fileInputLabelStyle = {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center'
  };
  
  const fileInputStyle = {
    display: 'none'
  };
  return (
    <div style={formContainerStyle}>
      <h1 style={{ color: '#dc3545', textAlign: 'center', marginBottom: '30px' }}>
        BloodLink Registration
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div style={photoUploadStyle}>
          <h2>Profile Photo</h2>
          
          {photoPreview ? (
            <img 
              src={photoPreview} 
              alt="Profile preview" 
              style={photoPreviewStyle} 
            />
          ) : (
            <div style={photoPlaceholderStyle}>
              No photo selected
            </div>
          )}
          
          <label style={fileInputLabelStyle}>
            {photo ? 'Change Photo' : 'Upload Photo'}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              style={fileInputStyle}
            />
          </label>
        </div>
      
        <div style={formLayoutStyle}>
          <div style={columnStyle}>
            <div style={sectionStyle}>
              <h2>Personal Information</h2>
              
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={inputStyle}
                required
              />
              
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={inputStyle}
                required
              />
              
              <label style={labelStyle}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              
              <label style={labelStyle}>Blood Type</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Select your blood type</option>
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
          </div>
          

            
  <div style={columnStyle}>
  <div style={sectionStyle}>
    <h2>Contact Information</h2>
    
    <label style={labelStyle}>Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="Enter your email"
      style={inputStyle}
      required
    />
    
    <label style={labelStyle}>Phone Number</label>
    <input
      type="tel"
      name="phoneNumber"
      value={formData.phoneNumber}
      onChange={handleChange}
      placeholder="Enter your phone number"
      style={inputStyle}
      required
    />
    
    <label style={labelStyle}>Address</label>
    <textarea
      name="address"
      value={formData.address}
      onChange={handleChange}
      placeholder="Enter your address"
      style={textareaStyle}
      required
    />
    
    <label style={labelStyle}>Emergency Contact</label>
    <input
      type="text"
      name="emergencyContact"
      value={formData.emergencyContact}
      onChange={handleChange}
      placeholder="Name and phone number"
      style={inputStyle}
      required
    />
  </div>
</div>
</div>

<div style={sectionStyle}>
<h2>Health Information</h2>

<label style={labelStyle}>Do you have any medical conditions?</label>
<textarea
  name="medicalConditions"
  value={formData.medicalConditions}
  onChange={handleChange}
  placeholder="List any medical conditions"
  style={textareaStyle}
/>

<label style={labelStyle}>Are you currently taking any medications?</label>
<textarea
  name="medications"
  value={formData.medications}
  onChange={handleChange}
  placeholder="List any medications"
  style={textareaStyle}
/>
</div>

<button 
type="submit" 
style={buttonStyle}
disabled={isSubmitting}
>
{isSubmitting ? 'Creating Profile...' : 'Create Profile'}
</button>

{message && <div style={messageStyle}>{message}</div>}
</form>
</div>
);
};

export default BloodDonationForm;