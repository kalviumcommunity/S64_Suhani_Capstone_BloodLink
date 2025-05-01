import React from 'react';

// Reusable BackButton component for all pages
export default function BackButton({ navigateTo }) {
  const primaryRed = '#d92027';
  
  return (
    <div style={{ padding: '1rem', display: 'flex' }}>
      <button
        onClick={() => navigateTo('home')}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'transparent',
          color: primaryRed,
          border: '1px solid ' + primaryRed,
          borderRadius: '4px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = primaryRed;
          e.currentTarget.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = primaryRed;
        }}
      >
        <span style={{ marginRight: '8px' }}>←</span> Back to Home
      </button>
    </div>
  );
}