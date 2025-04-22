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