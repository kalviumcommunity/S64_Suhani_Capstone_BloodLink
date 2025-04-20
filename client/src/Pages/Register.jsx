import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Nav from '../components/Nav'; // adjust path if needed

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google-login', {
        credential: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Google login failed');
    }
  };

  return (
    <>
      <Nav /> {/* <- navigation bar added here */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              padding: '16px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{
                height: '24px',
                width: '24px',
                color: '#ef4444'
              }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px',
            textAlign: 'center'
          }}>Create an Account</h2>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <GoogleLogin
            clientId="623636336763-dsusevrkricim5npu9qdefmpbabv4ugp.apps.googleusercontent.com"
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google Registration Failed')}
              shape="pill"
              text="signup_with"
              useOneTap
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0'
          }}></div>