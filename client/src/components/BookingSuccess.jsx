import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from './Nav';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingDetails = location.state?.bookingDetails;

  return (
    <>
      <Nav />

      <div
        style={{
          maxWidth: '700px',
          margin: '50px auto',
          padding: '40px',
          textAlign: 'center',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontFamily: 'Segoe UI, sans-serif'
        }}
      >
        <div style={{ fontSize: '60px' }}>🎉</div>

        <h1 style={{ color: '#2e7d32' }}>
          Booking Confirmed!
        </h1>

        <p>
          Your blood donation appointment has been successfully booked.
        </p>

        {bookingDetails && (
          <div
            style={{
              marginTop: '25px',
              padding: '20px',
              background: '#f7f9fa',
              borderRadius: '10px',
              textAlign: 'left'
            }}
          >
            <h3>Appointment Details</h3>

            <p>
              <strong>Center:</strong>{' '}
              {bookingDetails.center?.name || 'Blood Donation Center'}
            </p>

            <p>
              <strong>Date:</strong>{' '}
              {bookingDetails.date}
            </p>

            <p>
              <strong>Time:</strong>{' '}
              {bookingDetails.time}
            </p>

            <p>
              <strong>Booking ID:</strong>{' '}
              {bookingDetails.bookingId}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/Home')}
          style={{
            marginTop: '30px',
            padding: '12px 25px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Go to Home
        </button>
      </div>
    </>
  );
}
