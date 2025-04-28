// InventoryPrediction.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const InventoryPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/ai/inventory/predict?days=${days}`);
        setPrediction(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load inventory prediction');
        console.error('Error fetching prediction:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [days]);

  const handleDaysChange = (e) => {
    setDays(Number(e.target.value));
  };

  const handleFindDonors = (bloodType) => {
    navigate('/donor');
  };

  // Function to determine if we need to find donors for a specific blood type
  const needsDonors = (bloodType) => {
    if (!prediction || !prediction.predictedShortage) return false;
    return prediction.predictedShortage[bloodType] > 0;
  };

  // Styles
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
    formGroup: {
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    label: {
      fontWeight: '500',
      marginBottom: '0',
      fontSize: '16px',
      minWidth: '140px'
    },
    select: {
      height: '45px',
      borderRadius: '6px',
      fontSize: '16px',
      padding: '0 15px',
      borderColor: '#ced4da',
      width: '200px',
      outline: 'none',
      border: '1px solid #ced4da',
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
    },
    chartContainer: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      marginBottom: '30px'
    },
    sectionHeader: {
      color: '#2b2d42',
      marginBottom: '20px',
      fontWeight: '500',
      fontSize: '20px'
    },
    alertsContainer: {
      marginTop: '30px'
    },
    alert: {
      padding: '15px 20px',
      borderRadius: '6px',
      marginBottom: '15px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    alertWarning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      border: '1px solid #ffeeba'
    },
    alertSuccess: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    loading: {
      textAlign: 'center',
      padding: '40px 0',
      fontSize: '18px',
      color: '#666'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px 20px',
      borderRadius: '6px',
      marginBottom: '15px'
    },
    findDonorsBtn: {
      backgroundColor: '#4361ee',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    findDonorsBtnUrgent: {
      backgroundColor: '#e63946'
    },
    buttonText: {
      marginLeft: '8px'
    },
    typeBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: '#e9ecef',
      color: '#495057',
      fontWeight: '500',
      marginRight: '10px'
    },
    shortageAmount: {
      fontWeight: '600',
      color: '#e63946'
    },
    bloodDropIcon: {
      marginRight: '5px'
    }
  };

  if (loading) {
    return <div style={styles.loading}>
      <div style={{
        width: '40px',
        height: '40px',
        margin: '0 auto',
        borderRadius: '50%',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div style={{marginTop: '15px'}}>Loading prediction data...</div>
    </div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  // Prepare chart data
  const chartData = prediction ? {
    labels: Object.keys(prediction.currentInventory),
    datasets: [
      {
        label: 'Current Inventory',
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        data: Object.values(prediction.currentInventory)
      },
      {
        label: `Predicted Usage (${days} days)`,
        backgroundColor: 'rgba(255,99,132,0.4)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        data: Object.values(prediction.predictedUsage)
      },
      {
        label: 'Recommended Donations',
        backgroundColor: 'rgba(153,102,255,0.4)',
        borderColor: 'rgba(153,102,255,1)',
        borderWidth: 1,
        data: Object.values(prediction.recommendedDonations)
      }
    ]
  } : null;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Blood Inventory Prediction</h2>
      
      <div style={styles.formGroup}>
        <label htmlFor="days" style={styles.label}>Prediction Period:</label>
        <select 
          id="days" 
          value={days} 
          onChange={handleDaysChange}
          style={styles.select}
        >
          <option value="7">Next 7 days</option>
          <option value="14">Next 14 days</option>
          <option value="30">Next 30 days</option>
          <option value="60">Next 60 days</option>
          <option value="90">Next 90 days</option>
        </select>
      </div>
      
      {prediction && (
        <>
          <div style={styles.chartContainer}>
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Units of Blood'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Blood Type'
                    }
                  }
                }
              }}
              style={{height: '400px'}}
            />
          </div>
          
          <div style={styles.alertsContainer}>
            <h3 style={styles.sectionHeader}>Potential Shortages</h3>
            {prediction.predictedShortage && Object.entries(prediction.predictedShortage)
              .filter(([_, shortage]) => shortage > 0)
              .map(([bloodType, shortage]) => (
                <div key={bloodType} style={{...styles.alert, ...styles.alertWarning}}>
                  <div>
                    <span style={styles.typeBadge}>{bloodType}</span>
                    Predicted shortage of <span style={styles.shortageAmount}>{shortage} units</span>. 
                    Recommended to collect {prediction.recommendedDonations[bloodType]} units.
                  </div>
                  <button 
                    style={{
                      ...styles.findDonorsBtn,
                      ...(shortage > 10 ? styles.findDonorsBtnUrgent : {})
                    }}
                    onClick={() => handleFindDonors(bloodType)}
                  >
                    <span style={styles.bloodDropIcon}>🩸</span>
                    <span style={styles.buttonText}>Find Donors</span>
                  </button>
                </div>
              ))
            }
            
            {/* Show all blood types even if no shortage */}
            <div style={{marginTop: '30px'}}>
              <h3 style={{...styles.sectionHeader, fontSize: '18px'}}>All Blood Types</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}>
                {prediction.currentInventory && Object.keys(prediction.currentInventory).map(bloodType => (
                  <div key={bloodType} style={{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '130px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '24px', 
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: needsDonors(bloodType) ? '#e63946' : '#2b2d42'
                      }}>
                        {bloodType}
                      </div>
                      <div style={{fontSize: '14px', color: '#6c757d'}}>
                        Current: <b>{prediction.currentInventory[bloodType]} units</b>
                      </div>
                      <div style={{fontSize: '14px', color: '#6c757d'}}>
                        Predicted usage: <b>{prediction.predictedUsage[bloodType]} units</b>
                      </div>
                    </div>
                    <button
                      style={{
                        ...styles.findDonorsBtn,
                        width: '100%',
                        marginTop: '10px',
                        ...(needsDonors(bloodType) ? styles.findDonorsBtnUrgent : {})
                      }}
                      onClick={() => handleFindDonors(bloodType)}
                    >
                      Find Donors
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {prediction.predictedShortage && Object.values(prediction.predictedShortage).every(v => v === 0) && (
              <div style={{...styles.alert, ...styles.alertSuccess}}>
                No shortages predicted for the next {days} days!
              </div>
            )}
          </div>
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

export default InventoryPrediction;