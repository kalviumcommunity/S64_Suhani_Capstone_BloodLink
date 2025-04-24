import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
// import Nav from '../components/Nav'; // adjust path if needed
import Navbar from '../components/Navbar';

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
      // localStorage.setItem('userId', res.data.user._id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Google login failed');
    }
  };

  return (
    <>
      <Navbar /> {/* <- navigation bar added here */}
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
          }}>
            <div style={{
              flexGrow: 1,
              height: '1px',
              backgroundColor: '#d1d5db'
            }}></div>
            <div style={{
              margin: '0 16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>Or continue with</div>
            <div style={{
              flexGrow: 1,
              height: '1px',
              backgroundColor: '#d1d5db'
            }}></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>Full Name</label>
              <input
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '14px'
                }}
                type="text"
                name="name"
                placeholder="Enter your full name"
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>Email Address</label>
              <input
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '14px'
                }}
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
              }}>Password</label>
              <input
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '14px'
                }}
                type="password"
                name="password"
                placeholder="Create a password"
                onChange={handleChange}
                required
              />
            </div>

            <button
              style={{
                width: '100%',
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              type="submit"
            >
              Create Account
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '24px'
          }}>
            <span style={{ color: '#4b5563' }}>Already have an account? </span>
            <a href="/login" style={{
              color: '#ef4444',
              fontWeight: '500',
              textDecoration: 'none'
            }}>Login</a>
          </div>
        </div>
      </div>
    </>
  );
}
