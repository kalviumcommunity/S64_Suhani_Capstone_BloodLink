import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Centers from './components/NearbyCenters';
import Register from './pages/Register';
import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import Profile from './components/Profile';
// import EditProfile from './components/EditProfile';
// import Header from './components/Nav';
import Home from './pages/Home';
import HealthTips from './pages/HealthTips';
import ProfilePage from './pages/ProfilePage';
import BloodDonationForm from './pages/BloodDonationForm';
import Slot from './components/slot';
// import Slot from '../../backend/models/Slot';
import Confirmation from './components/Confirmation';
import Landingpage from './pages/Landingpage';
// import BookingSuccess from './components/BookingSuccess';
import NotificationSystem from './components/NotificationSystem';
// import NotificationToast from './components/NotificationToast';
import DonorSuggestions from './pages/DonorSuggestions';
import InventoryPrediction from './pages/InventoryPrediction';
import ContactUs from './pages/ContactUs'; 
import Donation from './components/Donation';
import InventoryForecast from './components/InventoryForecast';
import SmartDonorMatching from './components/SmartDonorMatching';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setAuthenticated(true);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            setAuthenticated(false);
          }
        } catch (error) {
          console.error('Error checking auth status:', error);
          localStorage.removeItem('token');
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthenticated(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        localStorage.removeItem('token');
        setUser(null);
        setAuthenticated(false);
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!authenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {/* <Header user={user} onLogout={handleLogout} /> */}
      
      <Routes>
        <Route path="/find-centers" element={<Centers />} />
        <Route path="/book-slot" element={<Slot/>} />
        <Route path="/" element={<Landingpage/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-booking" element={< Confirmation/>} />
        <Route path="/health-tips" element={<HealthTips />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/notification" element={<NotificationSystem />} />
        {/* <Route path="/notification-toast" element={<NotificationToast />} /> */}
        <Route path="/BloodDonationForm" element={<BloodDonationForm/>} />
        <Route path="/Home" element={<Home/>} />
        <Route path="/Inventory" element={<InventoryPrediction/>} />
        <Route path="/donor" element={<DonorSuggestions/>} />
        <Route path="/ContactUs" element={<ContactUs/>} />
        <Route path="/Donation" element={<Donation/>} />
        <Route path="/inventory-forecast" element={<InventoryForecast />} />
        <Route path="/donor-matching/:requestId" element={<SmartDonorMatching />} />
        {/* <Route path="/booking-success" element={<BookingSuccess />} /> */}
        <Route path="/login" element={
          authenticated ? <Navigate to="/profile" /> : <Login onLogin={handleLogin} />
        } />
        
        {/* <Route path="/profile" element={
          <ProtectedRoute>
            <Profile user={user} onDeleteAccount={handleDeleteAccount} />
          </ProtectedRoute>
        } />
        
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile user={user} setUser={setUser} />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard user={user} />
          </ProtectedRoute>
        } /> */}
      </Routes>
    </Router>
  );
}

export default App;
