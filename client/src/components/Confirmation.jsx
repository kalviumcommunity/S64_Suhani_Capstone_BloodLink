

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Nav from '../components/Nav';
const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000', // Replace with your actual API URL
});

export default function ConfirmBooking() {
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  
  // Get user authentication data
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const token = localStorage.getItem('token');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication and booking details
  useEffect(() => {
    // Check if user is logged in
    if (!userId || !token) {
      setError('Please log in to confirm your appointment.');
      navigate('/login', { state: { redirectAfterLogin: '/find-centers' } });
      return;
    }

    // Check booking details
    if (location.state && location.state.bookingDetails) {
      const details = location.state.bookingDetails;
      // If userId wasn't passed in state, use the one from localStorage
      if (!details.userId && userId) {
        details.userId = userId;
      }
      setBookingDetails(details);
    } else {
      setError('No booking details found. Please start the booking process again.');
    }
  }, [location.state, userId, token, navigate]);

  const handleConfirmBooking = async () => {
    if (!isEligible) {
      setError('Please confirm that you are eligible to donate blood.');
      return;
    }

    try {
      setLoading(true);
      
      // Double-check user authentication
      const currentUserId = userId || localStorage.getItem('userId');
      const currentToken = token || localStorage.getItem('token');
      
      if (!currentUserId || !currentToken) {
        setError('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      // Log the data we're about to send for debugging
      console.log('Sending booking data:', {
        userId: currentUserId,
        centerId: bookingDetails.center._id,
        date: bookingDetails.date,
        time: bookingDetails.time,
        userConfirmedEligibility: isEligible
      });

      // Create new booking in database
      const response = await api.post('/api/slot/book', {
        userId: currentUserId,
        centerId: bookingDetails.center._id,
        date: bookingDetails.date,
        time: bookingDetails.time,
        userConfirmedEligibility: isEligible
      }, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      console.log('Booking response:', response.data);
      
      // Navigate to success page
      navigate('/booking-success', {
        state: {
          bookingDetails: {
            ...bookingDetails,
            bookingId: response.data._id || (response.data.slot && response.data.slot._id),
            confirmed: true
          }
        }
      });
    } catch (err) {
      console.error('Error confirming booking:', err);
      
      // Check for specific error types
      if (err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else {
          setError(err.response.data?.error || 'Failed to confirm appointment. Please try again.');
        }
      } else {
        setError('Failed to connect to server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '24px',
    },
    progressContainer: {
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
    stepCircle: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#d32f2f',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      marginBottom: '5px',
    },
    inactiveCircle: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: 'gray',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      marginBottom: '5px',
    },
    confirmTitle: {
      fontSize: '18px',
      fontWeight: '700',
      marginBottom: '16px',
    },
    card: {
      background: '#fff',
      padding: '25px',
      borderRadius: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px',
    },
    detailsTitle: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '16px',
    },
    detailsRow: {
      display: 'flex',
      marginBottom: '16px',
    },
    icon: {
      width: '24px',
      marginRight: '12px',
      color: '#666',
    },
    detailLabel: {
      fontSize: '14px',
      color: '#666',
    },
    detailValue: {
      fontWeight: '500',
    },
    detailAddress: {
      fontSize: '14px',
      color: '#666',
    },
    infoCard: {
      backgroundColor: '#fffde7',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      border: '1px solid #fff9c4',
    },
    infoHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
    },
    infoTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#795548',
    },
    bulletList: {
      paddingLeft: '16px',
    },
    bulletItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '4px',
      fontSize: '14px',
    },
    bullet: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: '#795548',
      marginRight: '8px',
      marginTop: '8px',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '24px',
      cursor: 'pointer',
    },
    checkbox: {
      marginRight: '8px',
      marginTop: '2px',
    },
    checkboxLabel: {
      fontSize: '14px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: '12px 25px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    confirmButton: {
      padding: '12px 25px',
      backgroundColor: '#d32f2f',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    errorMessage: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '16px',
    },
    loading: {
      textAlign: 'center',
      padding: '16px',
    },
  };
  return (
    <>
    <Nav />
        <div style={styles.container}>
          <div style={styles.title}>Book Your Blood Donation Slot</div>
    
          {/* Progress Steps */}
          <div style={styles.progressContainer}>
            <div style={styles.step}>
              <div style={styles.inactiveCircle}>1</div>
              <span>Select Center</span>
            </div>
            <div style={styles.step}>
              <div style={styles.inactiveCircle}>2</div>
              <span>Choose Time</span>
            </div>
            <div style={{ ...styles.step, ...styles.activeStep }}>
              <div style={styles.stepCircle}>3</div>
              <span>Confirm</span>
            </div>
          </div>
    
          <div style={styles.confirmTitle}>Confirm Your Appointment</div>
    
          <div style={styles.card}>
            <div style={styles.detailsTitle}>Appointment Details</div>
            
            {error && <div style={styles.errorMessage}>{error}</div>}
    
            {bookingDetails ? (
              <>
                <div style={styles.detailsRow}>
                  <div style={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Donation Center</div>
                    <div style={styles.detailValue}>{bookingDetails.center.name || 'Blood Donation Center'}</div>
                    <div style={styles.detailAddress}>
                      {bookingDetails.center.location?.formatted_address || 
                       bookingDetails.center.address || 
                       'AIIMS Campus, Ansari Nagar, New Delhi - 110029'}
                    </div>
                  </div>
                </div>
                
                <div style={styles.detailsRow}>
                  <div style={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Date</div>
                    <div>{formatDate(bookingDetails.date)}</div>
                  </div>
                </div>
                
                <div style={styles.detailsRow}>
                  <div style={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={styles.detailLabel}>Time</div>
                    <div>{bookingDetails.time}</div>
                  </div>
                </div>
              </>
            ) : !error && (
              <div style={styles.loading}>
                <p>Loading appointment details...</p>
              </div>
            )}
          </div>
    
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', color: '#795548'}}>
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div style={styles.infoTitle}>Important Information</div>
            </div>
            
            <div style={styles.bulletList}>
              <div style={styles.bulletItem}>
                <div style={styles.bullet}></div>
                <div>Please bring a valid ID proof</div>
              </div>
              <div style={styles.bulletItem}>
                <div style={styles.bullet}></div>
                <div>Ensure you've had a meal before donating</div>
              </div>
              <div style={styles.bulletItem}>
                <div style={styles.bullet}></div>
                <div>Stay hydrated before your appointment</div>
              </div>
              <div style={styles.bulletItem}>
                <div style={styles.bullet}></div>
                <div>Wear comfortable clothing with sleeves that can be rolled up</div>
              </div>
              <div style={styles.bulletItem}>
                <div style={styles.bullet}></div>
                <div>The donation process takes about 30-45 minutes</div>
              </div>
            </div>
          </div>
    
          <label style={styles.checkboxContainer}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={isEligible}
              onChange={(e) => setIsEligible(e.target.checked)}
            />
            <span style={styles.checkboxLabel}>
              I confirm that I am eligible to donate blood and the information provided is correct
            </span>
          </label>
    
          <div style={styles.buttonContainer}>
            <button 
              onClick={handleBack}
              style={styles.backButton}
              disabled={loading}
            >
              Back
            </button>
            <button 
              onClick={handleConfirmBooking}
              disabled={!isEligible || loading}
              style={!isEligible || loading ? {...styles.confirmButton, ...styles.disabledButton} : styles.confirmButton}
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
        </>
      );
    }
//   return (
//     <div style={styles.container}>
//       <div style={styles.title}>Book Your Blood Donation Slot</div>

//       {/* Progress Steps */}
//       <div style={styles.progressContainer}>
//         <div style={styles.step}>
//           <div style={styles.inactiveCircle}>1</div>
//           <span>Select Center</span>
//         </div>
//         <div style={styles.step}>
//           <div style={styles.inactiveCircle}>2</div>
//           <span>Choose Time</span>
//         </div>
//         <div style={{ ...styles.step, ...styles.activeStep }}>
//           <div style={styles.stepCircle}>3</div>
//           <span>Confirm</span>
//         </div>
//       </div>

//       <div style={styles.confirmTitle}>Confirm Your Appointment</div>

//       <div style={styles.card}>
//         <div style={styles.detailsTitle}>Appointment Details</div>
        
//         {error && <div style={styles.errorMessage}>{error}</div>}

//         {bookingDetails ? (
//           <>
//             <div style={styles.detailsRow}>
//               <div style={styles.icon}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div>
//                 <div style={styles.detailLabel}>Donation Center</div>
//                 <div style={styles.detailValue}>{bookingDetails.center.name || 'Blood Donation Center'}</div>
//                 <div style={styles.detailAddress}>
//                   {bookingDetails.center.location?.formatted_address || 
//                    bookingDetails.center.address || 
//                    'AIIMS Campus, Ansari Nagar, New Delhi - 110029'}
//                 </div>
//               </div>
//             </div>
            
//             <div style={styles.detailsRow}>
//               <div style={styles.icon}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div>
//                 <div style={styles.detailLabel}>Date</div>
//                 <div>{formatDate(bookingDetails.date)}</div>
//               </div>
//             </div>
            
//             <div style={styles.detailsRow}>
//               <div style={styles.icon}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div>
//                 <div style={styles.detailLabel}>Time</div>
//                 <div>{bookingDetails.time}</div>
//               </div>
//             </div>
            
//             <div style={styles.detailsRow}>
//               <div style={styles.icon}>
//                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div>
//                 <div style={styles.detailLabel}>User ID</div>
//                 <div>{bookingDetails.userId || userId || 'Not available'}</div>
//               </div>
//             </div>
//           </>
//         ) : !error && (
//           <div style={styles.loading}>
//             <p>Loading appointment details...</p>
//           </div>
//         )}
//       </div>

//       <div style={styles.infoCard}>
//         <div style={styles.infoHeader}>
//           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{marginRight: '8px', color: '#795548'}}>
//             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//           </svg>
//           <div style={styles.infoTitle}>Important Information</div>
//         </div>
        
//         <div style={styles.bulletList}>
//           <div style={styles.bulletItem}>
//             <div style={styles.bullet}></div>
//             <div>Please bring a valid ID proof</div>
//           </div>
//           <div style={styles.bulletItem}>
//             <div style={styles.bullet}></div>
//             <div>Ensure you've had a meal before donating</div>
//           </div>
//           <div style={styles.bulletItem}>
//             <div style={styles.bullet}></div>
//             <div>Stay hydrated before your appointment</div>
//           </div>
//           <div style={styles.bulletItem}>
//             <div style={styles.bullet}></div>
//             <div>Wear comfortable clothing with sleeves that can be rolled up</div>
//           </div>
//           <div style={styles.bulletItem}>
//             <div style={styles.bullet}></div>
//             Wear comfortable clothing with sleeves that can be rolled up</div>
// //           </div>
// //           <div style={styles.bulletItem}>
// //             <div style={styles.bullet}></div>
// //             <div>The donation process takes about 30-45 minutes</div>
// //           </div>
// //         </div>
// //       </div>
// //  <div>Wear comfortable clothing with sleeves that can be rolled up</div>
// //            </div>
// //            <div style={styles.bulletItem}>
// //              <div style={styles.bullet}></div>
// //              <div>The donation process takes about 30-45 minutes</div>
// //            </div>
// //          </div>
// //        </div>
 
//        <label style={styles.checkboxContainer}>
//          <input
//            type="checkbox"
//            style={styles.checkbox}
//            checked={isEligible}
//            onChange={(e) => setIsEligible(e.target.checked)}
//          />
//          <span style={styles.checkboxLabel}>
//            I confirm that I am eligible to donate blood and the information provided is correct
//          </span>
//        </label>
 
//        <div style={styles.buttonContainer}>
//          <button 
//            onClick={handleBack}
//            style={styles.backButton}
//            disabled={loading}
//          >
//            Back
//          </button>
//          <button 
//            onClick={handleConfirmBooking}
//            disabled={!isEligible || loading}
//            style={!isEligible || loading ? {...styles.confirmButton, ...styles.disabledButton} : styles.confirmButton}
//          >
//            {loading ? 'Processing...' : 'Confirm Booking'}
//          </button>
//        </div>
//      </div>
//    );
//  }

