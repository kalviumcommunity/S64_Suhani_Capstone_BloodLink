import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000'  // Replace with your actual API URL
});

export default function BookSlot() {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [error, setError] = useState('');

  // Get user authentication data
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const token = localStorage.getItem('token');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is logged in
  useEffect(() => {
    if (!userId || !token) {
      setError('Please log in to book an appointment.');
      navigate('/login', { state: { redirectAfterLogin: '/find-centers' } });
    }
  }, [userId, token, navigate]);
  
  // Get center data from location state if available
  useEffect(() => {
    if (location.state && location.state.selectedCenter) {
      setSelectedCenter(location.state.selectedCenter);
    } else {
      setError('No center selected. Please go back and select a center first.');
    }
  }, [location.state]);

  // Fetch available time slots when center or date changes
  useEffect(() => {
    if (selectedCenter && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedCenter, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setFetchingSlots(true);
      setError('');
      
      // If the API endpoint for available slots exists:
      
      const response = await api.get(`/api/slot/available/${selectedCenter._id}/${selectedDate}`);
      console.log('Available slots response:', response.data);
      if (response.data && response.data.availableSlots) {
        setAvailableTimeSlots(response.data.availableSlots);
        // Reset selected time if it's no longer available
        if (selectedTime && !response.data.availableSlots.includes(selectedTime)) {
          setSelectedTime(null);
        }
      }
    } catch (err) {
      console.error('Error fetching available slots:', err);
      // Fallback to default slots if fetch fails
      setAvailableTimeSlots([
        "09:00 AM", "10:00 AM", "11:00 AM", 
        "12:00 PM", "01:00 PM", "02:00 PM",
        "03:00 PM", "04:00 PM", "05:00 PM"
      ]);
      
      if (err.response && err.response.status === 404) {
        setError('Could not fetch available slots. Using default slots instead.');
      }
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleContinue = async () => {
    if (!selectedTime) {
      setError('Please select a time slot.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Ensure we have the user ID
      if (!userId) {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setError('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
      }

      // Navigate to confirm-booking page with booking details
      navigate('/confirm-booking', {
        state: {
          bookingDetails: {
            center: selectedCenter,
            date: selectedDate,
            time: selectedTime,
            userId: userId  // Make sure to include userId
          }
        }
      });
      
    } catch (err) {
      console.error('Error preparing booking:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to prepare booking. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '40px auto',
      padding: '30px',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f7f9fa',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '26px',
      fontWeight: '600',
    },
    stepper: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
      fontWeight: '500',
    },
    step: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'gray',
    },
    activeStep: {
      color: '#d32f2f',
      fontWeight: 'bold',
    },
    card: {
      background: '#fff',
      padding: '25px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    centerCard: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '15px',
      padding: '15px',
      border: '1px solid #eee',
      borderRadius: '10px',
      marginBottom: '20px',
    },
    icon: {
      fontSize: '22px',
      color: '#d32f2f',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '500',
    },
    dateInput: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      marginBottom: '20px',
    },
    timeSlotsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      marginTop: '15px',
    },
    timeSlot: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      border: '1px solid #eee',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    selectedTimeSlot: {
      backgroundColor: '#ffebee',
      borderColor: '#d32f2f',
      color: '#d32f2f',
      fontWeight: 'bold',
    },
    unavailableTimeSlot: {
      backgroundColor: '#f5f5f5',
      color: '#bdbdbd',
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    clockIcon: {
      marginRight: '5px',
      fontSize: '16px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '25px',
    },
    backButton: {
      padding: '12px 25px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    continueButton: {
      backgroundColor: '#d32f2f',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#ffebee',
      borderRadius: '5px',
      border: '1px solid #ffcdd2',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      borderRadius: '10px',
    },
    noSlotsMessage: {
      textAlign: 'center',
      padding: '20px',
      color: '#757575',
      fontStyle: 'italic',
    },
    refreshButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#d32f2f',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'underline',
      marginLeft: '10px',
    },
    infoNote: {
      backgroundColor: '#e8f5e9',
      borderRadius: '8px',
      padding: '10px 15px',
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: '#2e7d32',
    },
    infoIcon: {
      marginRight: '10px',
      fontSize: '18px',
    }
  };

  // Format display date
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Book Your Blood Donation Slot</h2>

      <div style={styles.stepper}>
        <div style={styles.step}>1 <span>Select Hospital</span></div>
        <div style={{ ...styles.step, ...styles.activeStep }}>2 <span>Choose Time</span></div>
        <div style={styles.step}>3 <span>Confirm</span></div>
      </div>

      <div style={styles.card}>
        {error && <div style={styles.error}>{error}</div>}

        {selectedCenter && (
          <>
            <h3>Select Date & Time</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Selected Center</label>
              <div style={styles.centerCard}>
                <span style={styles.icon}>🏥</span>
                <div>
                  <strong>{selectedCenter.name || 'Blood Donation Center'}</strong>
                  <br />
                  <span>{selectedCenter.location?.formatted_address || selectedCenter.address || 'No address'}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={styles.label}>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                style={styles.dateInput}
              />
              <div style={{ fontSize: '14px', color: '#666' }}>
                Selected: {formatDisplayDate(selectedDate)}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={styles.label}>Available Time Slots</label>
                {!fetchingSlots && (
                  <button 
                    onClick={fetchAvailableSlots} 
                    style={styles.refreshButton}
                    title="Refresh available slots"
                  >
                    Refresh
                  </button>
                )}
              </div>
              
              {fetchingSlots ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  Loading available slots...
                </div>
              ) : availableTimeSlots.length > 0 ? (
                <div style={styles.timeSlotsContainer}>
                  {availableTimeSlots.map((time, index) => (
                    <div
                      key={index}
                      style={
                        selectedTime === time
                          ? { ...styles.timeSlot, ...styles.selectedTimeSlot }
                          : styles.timeSlot
                      }
                      onClick={() => handleTimeSelect(time)}
                    >
                      <span style={styles.clockIcon}>🕒</span> {time}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noSlotsMessage}>
                  No available slots for this date. Please select another date.
                </div>
              )}
            </div>

            <div style={styles.infoNote}>
              <span style={styles.infoIcon}>ℹ️</span>
              <span>Donation appointments typically take 45-60 minutes to complete.</span>
            </div>

            <div style={styles.buttonContainer}>
              <button style={styles.backButton} onClick={handleBack} disabled={loading}>
                Back
              </button>
              <button 
                style={{
                  ...styles.continueButton,
                  opacity: (selectedTime && !loading) ? 1 : 0.6,
                  cursor: (selectedTime && !loading) ? 'pointer' : 'not-allowed'
                }} 
                onClick={handleContinue}
                disabled={!selectedTime || loading}
              >
                {loading ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </>
        )}

        {!selectedCenter && !error && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading center information...</p>
          </div>
        )}

        {loading && (
          <div style={styles.loadingOverlay}>
            <div>Processing your request...</div>
          </div>
        )}
      </div>
    </div>
  );
}