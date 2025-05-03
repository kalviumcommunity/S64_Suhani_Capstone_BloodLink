import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Extract backend URL to make it configurable
// const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

export default function NearbyCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState('');
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  
  const navigate = useNavigate();

  const fetchLocationAndCenters = () => {
    setLoading(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationAllowed(true);
        
        try {
          console.log(`Fetching hospitals at lat:${latitude}, lng:${longitude}`);
          const response = await axios.get(`${BACKEND_URL}/api/centers/nearby`, {
            params: { lat: latitude, lng: longitude },
          });
          
          if (response.data && response.data.length > 0) {
            setCenters(response.data);
            setError('');
          } else {
            setCenters([]);
            setError('No hospitals found in your area. Try searching for a specific location instead.');
          }
        } catch (err) {
          console.error('Error details:', err);
          setCenters([]);
          setError(`Failed to fetch nearby hospitals: ${err.response?.data?.message || err.message}`);
        } finally {
          setLoading(false);
        }
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setLocationAllowed(false);
        setError(`Location access ${geoError.code === 1 ? 'denied' : 'failed'}. Please enable location or try using the search option.`);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const fetchCentersByPlace = async () => {
    if (!manualLocation.trim()) {
      alert("Please enter a location.");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log(`Searching for hospitals near: ${manualLocation}`);
      const response = await axios.get(`${BACKEND_URL}/api/centers/search`, {
        params: { query: manualLocation },
      });
      
      if (response.data && response.data.length > 0) {
        setCenters(response.data);
        setError('');
      } else {
        setCenters([]);
        setError(`No hospitals found near "${manualLocation}". Try a different location.`);
      }
    } catch (err) {
      console.error('Search error details:', err);
      setCenters([]);
      setError(`Could not find hospitals for "${manualLocation}": ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
  };

  const handleContinue = () => {
    if (selectedIndex === null) {
      alert('Please select a hospital first.');
      return;
    }
    
    const selectedCenter = centers[selectedIndex];
    console.log('Selected hospital:', selectedCenter);
    
    // Navigate to booking page with selected center information
    navigate('/book-slot', { 
      state: { selectedCenter }
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
    locationBtn: {
      marginBottom: '15px',
      backgroundColor: '#e53935',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    inputBox: {
      padding: '10px',
      width: '100%',
      borderRadius: '8px',
      border: '1px solid #ccc',
      marginBottom: '10px',
    },
    searchBtn: {
      backgroundColor: '#1976d2',
      color: '#fff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px',
      border: '1px solid #eee',
      borderRadius: '10px',
      marginBottom: '10px',
      cursor: 'pointer',
      backgroundColor: '#fdfdfd',
      transition: 'all 0.3s ease',
    },
    selectedItem: {
      backgroundColor: '#ffebee',
      borderColor: '#d32f2f',
    },
    details: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    locationIcon: {
      fontSize: '22px',
      color: '#d32f2f',
    },
    checkmark: {
      color: '#d32f2f',
      fontSize: '22px',
    },
    button: {
      backgroundColor: '#d32f2f',
      color: 'white',
      border: 'none',
      padding: '14px 30px',
      borderRadius: '8px',
      fontSize: '16px',
      marginTop: '25px',
      float: 'right',
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
    helpText: {
      fontStyle: 'italic',
      color: '#666',
      fontSize: '14px',
      marginTop: '5px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏥 Find a Blood Donation Center Near You</h2>

      <div style={styles.stepper}>
        <div style={{ ...styles.step, ...styles.activeStep }}>1 <span>Select Hospital</span></div>
        <div style={styles.step}>2 <span>Choose Time</span></div>
        <div style={styles.step}>3 <span>Confirm</span></div>
      </div>

      <div style={styles.card}>
        <button 
          style={{
            ...styles.locationBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          onClick={fetchLocationAndCenters} 
          disabled={loading}
        >
          {loading ? 'Loading...' : '📍 Use My Live Location'}
        </button>

        <p style={{ textAlign: 'center', margin: '10px 0' }}>OR</p>

        <input
          type="text"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          placeholder="Enter city, area or address"
          style={styles.inputBox}
          disabled={loading}
        />
        <button 
          style={{
            ...styles.searchBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }} 
          onClick={fetchCentersByPlace} 
          disabled={loading}
        >
          {loading ? 'Searching...' : '🔎 Search Blood Donation Center'}
        </button>
        <p style={styles.helpText}>Example: "New York" or "90210" or "Chicago, IL"</p>

        <h3 style={{ marginTop: '25px' }}>Select a Nearby Blood Donation Center</h3>

        {loading && <p>Loading nearby Blood Donation Center...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {centers.length === 0 && !loading && !error && (
          <p>No hospitals found. Please try searching for a location or use your current location.</p>
        )}

        <ul style={styles.list}>
          {centers.map((center, index) => (
            <li
              key={index}
              style={
                selectedIndex === index
                  ? { ...styles.item, ...styles.selectedItem }
                  : styles.item
              }
              onClick={() => handleSelect(index)}
            >
              <div style={styles.details}>
                <span style={styles.locationIcon}>🏥</span>
                <div>
                  <strong>{center.name || center?.categories?.[0]?.name || 'Unknown Hospital'}</strong><br />
                  <span>{center.location?.formatted_address || center.location?.address || 'No address'}</span>
                </div>
              </div>
              {selectedIndex === index && <span style={styles.checkmark}>✅</span>}
            </li>
          ))}
        </ul>

        {centers.length > 0 && (
          <button style={styles.button} onClick={handleContinue}>Continue ➡️</button>
        )}
      </div>
    </div>
  );
}