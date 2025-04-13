// Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" style={{
          height: '24px',
          width: '24px',
          color: '#ef4444',
          marginRight: '8px'
        }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-5.33 4-8 8-8 12 0 4.42 3.58 8 8 8s8-3.58 8-8c0-4-2.67-8-8-12z" />
        </svg>
        <Link to="/" style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#111827',
          textDecoration: 'none'
        }}>BloodLink</Link>
      </div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          margin: '0 16px',
          color: '#111827',
          textDecoration: 'none'
        }}>Home</Link>
        <Link to="/find-centers" style={{
          margin: '0 16px',
          color: '#111827',
          textDecoration: 'none'
        }}>Find Centers</Link>
        <Link to="/book-slot" style={{
          margin: '0 16px',
          color: '#111827',
          textDecoration: 'none'
        }}>Book Slot</Link>
        <Link to="/health-tips" style={{
          margin: '0 16px',
          color: '#111827',
          textDecoration: 'none'
        }}>HealthTips</Link>
      </div>
      
      <Link to="/login" style={{
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '500',
        fontSize: '14px'
      }}>Login / Register</Link>
    </nav>
  );
}