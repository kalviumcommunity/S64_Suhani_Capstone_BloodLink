import React, { useEffect, useState, useRef } from 'react';

import { io } from 'socket.io-client';

function EmergencyNotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'emergency', 'general'
  const socketRef = useRef(null);
  const notificationSound = useRef(new Audio('/alert-sound.mp3'));

  useEffect(() => {

    // Connect to the server
    socketRef.current = io('http://localhost:5000');

    
    // Set up event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to notification server');
      setIsConnected(true);
      
      // Get existing notifications on connection
      fetchExistingNotifications();
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setIsConnected(false);
    });

    socketRef.current.on('notification', (data) => {
      // We expect the server to send an object with message, type, and additional data
      const { message, type = 'general', additionalData = {} } = typeof data === 'object' ? data : { message: data };
      
      const newNotification = {
        id: Date.now(),
        message,
        type, // 'emergency' or 'general'
        additionalData, // Could contain blood type, location, contact info, etc.
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString()
      };

      // Play sound for emergency notifications
      if (type === 'emergency') {
        notificationSound.current.play().catch(err => console.log('Failed to play notification sound'));
        // Request browser notification permission and show notification
        showBrowserNotification(message);
      }

      setNotifications(prev => [newNotification, ...prev]);
    }
  );

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to fetch existing notifications
  const fetchExistingNotifications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notify/all');
      const data = await response.json();
      if (data.notifications) {
        // Add type property if it doesn't exist
        const processedNotifications = data.notifications.map(notification => ({
          ...notification,
          type: notification.type || 'general',
          additionalData: notification.additionalData || {}
        }
      ));
        setNotifications(processedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Function to show browser notifications
  const showBrowserNotification = (message) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Emergency Blood Request", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Emergency Blood Request", { body: message });
        }
      }
    );
    }
  };

  // Handle user response to blood donation request
  const handleRespond = (notificationId, response) => {
    // Here you would implement the logic to notify the server about the user's response
    console.log(`User responded to notification ${notificationId} with: ${response}`);
    
    // Example implementation - update the server
    fetch('http://localhost:5000/api/notify/respond', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId,
        response
      }),
    });
    
    // Update local state to show the user has responded
    setNotifications(notifications.map(notif => 
      notif.id === notificationId 
        ? { ...notif, userResponse: response } 
        : notif
    ));
  };

  // Filter notifications based on selected type
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  return (
    <div className="notification-container">
      <h1 className="notification-header">
        Emergency Notification System
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </h1>

      {/* Filter options */}
      <div className="filter-controls">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Notifications
        </button>
        <button 
          className={`filter-btn emergency-btn ${filter === 'emergency' ? 'active' : ''}`}
          onClick={() => setFilter('emergency')}
        >
          Emergency Requests
        </button>
        <button 
          className={`filter-btn ${filter === 'general' ? 'active' : ''}`}
          onClick={() => setFilter('general')}
        >
          General Notifications
        </button>
      </div>

      {/* Notification Display Section */}
      <div className="notifications-panel">
        <h2>Recent Notifications</h2>
        {filteredNotifications.length === 0 ? (
          <p className="no-notifications">No notifications yet</p>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-card ${notification.type === 'emergency' ? 'emergency' : 'general'}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  
                  {/* Additional data for emergency blood requests */}
                  {notification.type === 'emergency' && notification.additionalData && (
                    <div className="emergency-details">
                      {notification.additionalData.bloodType && (
                        <span className="blood-type">
                          Blood Type: <strong>{notification.additionalData.bloodType}</strong>
                        </span>
                      )}
                      {notification.additionalData.location && (
                        <span className="location">
                          Location: {notification.additionalData.location}
                        </span>
                      )}
                      {notification.additionalData.hospitalName && (
                        <span className="hospital">
                          Hospital: {notification.additionalData.hospitalName}
                        </span>
                      )}
                      {notification.additionalData.contactNumber && (
                        <span className="contact">
                          Contact: {notification.additionalData.contactNumber}
                        </span>
                      )}
                      {notification.additionalData.unitsNeeded && (
                        <span className="units">
                          Units Needed: {notification.additionalData.unitsNeeded}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <small className="notification-time">{notification.timestamp}</small>
                  


                  {/* Response buttons for emergency notifications */}
                  {notification.type === 'emergency' && !notification.userResponse && (
                    <div className="response-buttons">
                      <button 
                        className="respond-yes"
                        onClick={() => handleRespond(notification.id, 'yes')}
                      >
                        I Can Donate
                      </button>
                      <button 
                        className="respond-no"
                        onClick={() => handleRespond(notification.id, 'no')}
                      >
                        Cannot Help
                      </button>
                    </div>
                  )}
                  
                  {/* Show response if user has already responded */}
                  {notification.userResponse && (
                    <div className="user-response">
                      Your response: <strong>{notification.userResponse === 'yes' ? 'I will donate' : 'Cannot help'}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS styles */}
      <style jsx>{`
        .notification-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .notification-header {
          color: #333;
          border-bottom: 2px solid #eee;
          padding-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .connection-status {
          font-size: 14px;
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
        }
        
        .connected {
          background-color: #4CAF50;
        }
        
        .disconnected {
          background-color: #f44336;
        }
        
        .filter-controls {
          display: flex;
          margin: 20px 0;
          gap: 10px;
        }
        
        .filter-btn {
          background-color: #f1f1f1;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          background-color: #e0e0e0;
        }
        
        .filter-btn.active {
          background-color: #007bff;
          color: white;
        }
        
        .emergency-btn.active {
          background-color: #dc3545;
        }
        
        .notifications-panel {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        
        .no-notifications {
          color: #666;
          text-align: center;
          padding: 20px;
        }
        
        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .notification-card {
          background-color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 16px;
          animation: fadeIn 0.3s ease-in-out;
          transition: transform 0.2s ease;
        }
        
        .notification-card:hover {
          transform: translateY(-2px);
        }
        
        .notification-card.emergency {
          border-left: 5px solid #dc3545;
        }
        
        .notification-card.general {
          border-left: 5px solid #007bff;
        }
        
        .notification-message {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .notification-time {
          color: #777;
          display: block;
          margin-top: 8px;
        }
        
        .emergency-details {
          background-color: #f8f8f8;
          border-radius: 6px;
          padding: 12px;
          margin: 10px 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .emergency-details span {
          background-color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          display: inline-block;
        }
        
        .blood-type {
          color: #dc3545;
          border: 1px solid #dc3545;
        }
        
        .location, .hospital, .contact, .units {
          color: #333;
          border: 1px solid #ddd;
        }
        
        .response-buttons {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }
        
        .response-buttons button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .respond-yes {
          background-color: #4CAF50;
          color: white;
        }
        
        .respond-no {
          background-color: #f1f1f1;
          color: #333;
        }
        
        .respond-yes:hover {
          background-color: #45a049;
        }
        
        .respond-no:hover {
          background-color: #e0e0e0;
        }
        
        .user-response {
          margin-top: 10px;
          padding: 8px;
          background-color: #e8f4fd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        
        .notification-card.emergency {
          animation: fadeIn 0.3s ease-in-out, pulse 2s infinite;
        }
      `}</style>
    </div>
  );}

export default EmergencyNotificationSystem;