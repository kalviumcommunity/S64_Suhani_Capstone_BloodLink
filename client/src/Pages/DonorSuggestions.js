// DonorSuggestions.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';

const DonorSuggestions = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get bloodType from state/URL or default to null
  const [bloodType, setBloodType] = useState(
    location.state?.bloodType || searchParams.get('bloodType') || ''
  );
  
  // Add blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  
  // Handle blood type selection
  const handleBloodTypeChange = (e) => {
    const newBloodType = e.target.value;
    setBloodType(newBloodType);
    setSearchParams({ bloodType: newBloodType });
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!bloodType) {
        setSuggestions(null);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`/api/ai/suggest/donors/${bloodType}`);
        setSuggestions(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load donor suggestions. Please try again.');
        console.error('Error fetching donor suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [bloodType]);

  // Function to handle contacting donor
  const handleContactDonor = (donor) => {
    // This is a placeholder for the actual contact functionality
    alert(`Contact ${donor.name} at ${donor.email || donor.phone || 'N/A'}`);
  };

  // Custom inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '30px 20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      color: '#333',
      borderBottom: '2px solid #e63946',
      paddingBottom: '15px',
      marginBottom: '30px',
      fontWeight: '600'
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
      overflow: 'hidden',
      border: 'none'
    },
    cardBody: {
      padding: '25px'
    },
    cardTitle: {
      color: '#2b2d42',
      fontWeight: '600',
      marginBottom: '20px',
      fontSize: '18px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    select: {
      height: '50px',
      borderRadius: '6px',
      fontSize: '16px',
      padding: '0 15px',
      borderColor: '#ced4da',
      width: '100%',
      outline: 'none',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
    },
    bloodTypeHighlight: {
      color: '#e63946',
      fontWeight: '700'
    },
    alert: {
      padding: '15px 20px',
      borderRadius: '6px',
      marginBottom: '25px'
    },
    alertInfo: {
      backgroundColor: '#d1ecf1',
      color: '#0c5460',
      border: '1px solid #bee5eb'
    },
    alertDanger: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    },
    spinner: {
      width: '3rem',
      height: '3rem',
      margin: '40px auto',
      display: 'block',
      border: '5px solid rgba(0, 123, 255, 0.2)',
      borderTop: '5px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    tableContainer: {
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '0'
    },
    tableHeader: {
      backgroundColor: '#2b2d42',
      color: 'white',
      fontWeight: '500',
      padding: '15px',
      fontSize: '14px',
      textAlign: 'left'
    },
    tableRow: {
      borderBottom: '1px solid #e9ecef',
      ':hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    tableCell: {
      padding: '15px',
      verticalAlign: 'middle',
      fontSize: '14px'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: '30px',
      fontWeight: '500',
      fontSize: '12px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    },
    badgeSuccess: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    badgeSecondary: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    progress: {
      height: '8px',
      width: '100%',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressBar: {
      backgroundColor: '#4361ee',
      height: '100%',
      textAlign: 'center',
      fontSize: '10px',
      lineHeight: '8px',
      color: '#fff',
      transition: 'width 0.6s ease'
    },
    btnGroup: {
      display: 'flex',
      gap: '5px'
    },
    btnSuccess: {
      backgroundColor: '#28a745',
      border: 'none',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '13px',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'background-color 0.2s'
    },
    btnOutline: {
      backgroundColor: 'transparent',
      border: '1px solid #4361ee',
      color: '#4361ee',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '13px',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    infoCard: {
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #4361ee'
    },
    smallText: {
      fontSize: '13px',
      color: '#6c757d'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Donor Suggestions</h2>
      
      <div style={styles.card}>
        <div style={styles.cardBody}>
          <h5 style={styles.cardTitle}>Select Blood Type</h5>
          <div style={styles.formGroup}>
            <select 
              id="bloodType"
              style={styles.select}
              value={bloodType}
              onChange={handleBloodTypeChange}
            >
              <option value="">-- Select Blood Type --</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!bloodType && (
        <div style={{...styles.alert, ...styles.alertInfo}}>
          Please select a blood type to see suggested donors.
        </div>
      )}

      {loading && (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <div style={styles.spinner}>
            <span style={{display: 'none'}}>Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{...styles.alert, ...styles.alertDanger}}>{error}</div>
      )}

      {bloodType && suggestions && (
        <>
          <h3 style={{marginBottom: '20px', fontWeight: '500'}}>
            Suggested Donors for <span style={styles.bloodTypeHighlight}>{bloodType}</span> Blood
          </h3>
          
          {suggestions.suggestedDonors?.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Name', 'Blood Type', 'Last Donation', 'Priority Score', 'Action'].map(header => (
                      <th key={header} style={styles.tableHeader}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suggestions.suggestedDonors.map((item) => (
                    <tr key={item.donor.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{item.donor.name}</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.badge, 
                          ...(item.donor.bloodType === bloodType ? styles.badgeSuccess : styles.badgeSecondary)
                        }}>
                          {item.donor.bloodType}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        {item.donor.lastDonation
                          ? new Date(item.donor.lastDonation).toLocaleDateString()
                          : 'Never donated'}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.progress}>
                          <div 
                            style={{
                              ...styles.progressBar,
                              width: `${(item.score / 50) * 100}%`,
                              backgroundColor: 
                                item.score > 40 ? '#28a745' : 
                                item.score > 30 ? '#17a2b8' :
                                item.score > 20 ? '#ffc107' : '#dc3545'
                            }}
                          />
                        </div>
                        <div style={{textAlign: 'center', marginTop: '5px', fontSize: '12px'}}>
                          {item.score}/50
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.btnGroup}>
                          <button
                            style={styles.btnSuccess}
                            onClick={() => handleContactDonor(item.donor)}
                          >
                            <span style={{marginRight: '5px'}}>📞</span> Contact
                          </button>
                          <button
                            style={styles.btnOutline}
                            onClick={() => alert(`View ${item.donor.name}'s profile`)}
                          >
                            <span style={{marginRight: '5px'}}>👤</span> Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{...styles.alert, ...styles.alertInfo}}>
              No suitable donors found for {bloodType} blood type.
            </div>
          )}
          
          {/* Additional contextual information */}
          {suggestions.suggestedDonors?.length > 0 && (
            <div style={{...styles.card, ...styles.infoCard, marginTop: '30px'}}>
              <div style={styles.cardBody}>
                <h5 style={styles.cardTitle}>About These Suggestions</h5>
                <p style={{marginBottom: '15px', lineHeight: '1.6'}}>
                  These donors were selected based on blood compatibility, donation history, 
                  and time since last donation. Donors with a direct match to the requested 
                  blood type ({bloodType}) are given higher priority.
                </p>
                <p style={styles.smallText}>
                  <strong>Compatible blood types for {bloodType} recipients:</strong> {' '}
                  {bloodType === 'AB+' ? 'All blood types' : 
                   bloodType === 'AB-' ? 'A-, B-, AB-, O-' :
                   bloodType === 'A+' ? 'A+, A-, O+, O-' :
                   bloodType === 'A-' ? 'A-, O-' :
                   bloodType === 'B+' ? 'B+, B-, O+, O-' :
                   bloodType === 'B-' ? 'B-, O-' :
                   bloodType === 'O+' ? 'O+, O-' :
                   'O-'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Adding some CSS animation for the spinner */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default DonorSuggestions;