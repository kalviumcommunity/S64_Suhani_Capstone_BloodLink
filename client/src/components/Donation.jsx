import React, { useState } from 'react';
import axios from 'axios';
import Nav from '../components/Nav';

// IMPORTANT: Replace this with your actual Razorpay test key ID from your dashboard
// Test mode keys start with 'rzp_test_'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Backend URL configuration - replace with your actual backend URL
// const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Default local development URL
const BACKEND_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';
const Donation = () => {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  
  // // Inline 
  const styles = {
    pageContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    pageTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: '40px',
      textAlign: 'center'
    },
    donationContainer: {
      maxWidth: '500px',
      width: '100%',
      margin: '0 auto',
      padding: '100px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      textAlign: 'left'
    },
    header: {
      fontSize: '34px',
      fontWeight: 'bold',
      marginBottom: '34px',
      textAlign: 'center',
      color: '#333'
    },
    amountSelection: {
      margin: '20px 0',
      textAlign: 'left'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold'
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px'
    },
    donateButton: {
      backgroundColor: '#3399cc',
      color: 'white',
      border: 'none',
      padding: '14px 28px',
      fontSize: '16px',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
      width: '100%',
      marginTop: '20px'
    },
    donateButtonHover: {
      backgroundColor: '#2980b9'
    },
    donateButtonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed'
    },
    donationNote: {
      fontSize: '14px',
      color: '#666',
      marginTop: '20px',
      textAlign: 'center'
    },
    footer: {
      marginTop: '48px',
      color: '#666666',
      fontSize: '14px',
      textAlign: 'center'
    }
  };
  
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleDonation = async () => {
    try {
      setLoading(true);
      
      const res = await loadRazorpay();
      
      if (!res) {
        alert('Razorpay SDK failed to load. Please check your connection');
        setLoading(false);
        return;
      }
      
      // Make a request to your backend to create an order
      console.log('Creating order with amount:', amount * 100);
      const { data } = await axios.post(`${BACKEND_URL}/api/donation/create-order`, { 
        amount: amount * 100  // Razorpay expects amount in paise
      }).catch(error => {
        console.error('Order creation API error:', error.response ? error.response.data : error.message);
        throw error;
      });
      
      console.log('Order created successfully:', data);
      
      const options = {
        key: RAZORPAY_KEY_ID, // Use your actual test key ID
        amount: data.amount,
        currency: data.currency,
        name: 'Your Organization Name',
        description: 'Donation',
        order_id: data.id,
        handler: async (response) => {
          try {
            console.log('Payment successful, verifying payment:', response);
            const { data } = await axios.post(`${BACKEND_URL}/api/donation/verify-payment`, {
              orderCreationId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            alert(data.msg);
          } catch (error) {
            console.error('Payment verification error:', error.response ? error.response.data : error.message);
          }
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        notes: {
          address: 'Your Organization Address'
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            setLoading(false);
          }
        }
      };
      
      console.log('Opening Razorpay with options:', options);
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed with response:', response);
        alert('Payment failed. Please try again. Contact support for help');
      });
    } catch (error) {
      console.error('Donation process error:', error);
      alert('Something went wrong: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Nav />
    <div style={styles.pageContainer}>
    <h1 style={styles.pageTitle}>Welcome to Our Donation Portal</h1>
    
    <div style={styles.donationContainer}>
      <h2 style={styles.header}>Support Our Cause</h2>
      <div style={styles.amountSelection}>
        <label style={styles.label} htmlFor="amount">Donation Amount (₹)</label>
        <input
          style={styles.input}
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
          min="1"
        />
      </div>
      <button 
        style={{
          ...styles.donateButton,
          ...(loading ? styles.donateButtonDisabled : {})
        }}
        onClick={handleDonation}
        disabled={loading}
        onMouseOver={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#2980b9';
          }
        }}
        onMouseOut={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#3399cc';
          }
        }}
      >
        {loading ? 'Processing...' : 'Donate Money'}
      </button>
      <p style={styles.donationNote}>
        Your contribution makes a difference. Thank you for your support!
      </p>
    </div>
    </div>
    </>
  );
};

export default Donation;