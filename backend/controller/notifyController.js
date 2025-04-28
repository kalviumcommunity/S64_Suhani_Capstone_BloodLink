const Notification = require('../models/Notification');
let sockets = [];

exports.saveSocket = (socket) => {
  sockets.push(socket);
};

exports.removeSocket = (socketId) => {
  sockets = sockets.filter(socket => socket.id !== socketId);
};

// Send notification to all connected clients and save to database
exports.sendReminder = async (req, res) => {
  try {
    const { message, type = 'general', additionalData = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Create expiration date - 24 hours for general, 8 hours for emergency
    const expiresAt = new Date();
    if (type === 'emergency') {
      expiresAt.setHours(expiresAt.getHours() + 8); // Emergency notifications expire faster
    } else {
      expiresAt.setDate(expiresAt.getDate() + 1); // Regular 24-hour expiration
    }
    
    // Save notification to database
    const notification = new Notification({
      message,
      type,
      additionalData,
      timestamp: new Date(),
      expiresAt
    });
    
    await notification.save();
    
    let activeSocketCount = 0;
    
    // Send to all active sockets
    sockets.forEach(socket => {
      if (socket.connected) {
        // Send the full notification object instead of just the message
        socket.emit('notification', {
          message,
          type,
          additionalData,
          id: notification._id
        });
        activeSocketCount++;
      }
    });
    
    res.json({
      msg: 'Notification sent',
      recipients: activeSocketCount,
      notification: {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        additionalData: notification.additionalData,
        timestamp: notification.timestamp
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// Send emergency blood request to all connected clients
exports.sendBloodRequest = async (req, res) => {
  try {
    const { 
      bloodType, 
      location, 
      hospitalName, 
      contactNumber, 
      unitsNeeded, 
      patientName, 
      urgency 
    } = req.body;
    
    if (!bloodType || !location || !hospitalName || !contactNumber) {
      return res.status(400).json({ error: 'Blood type, location, hospital name, and contact number are required' });
    }
    
    // Create message for the emergency
    const message = `URGENT: ${bloodType} blood donation needed at ${hospitalName}`;
    
    // Create expiration date - emergency notifications expire in 8 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);
    
    // Prepare additional data
    const additionalData = {
      bloodType,
      location,
      hospitalName,
      contactNumber,
      unitsNeeded: unitsNeeded || '1-2 units',
      patientName: patientName || 'Anonymous',
      urgency: urgency || 'High',
      requestTime: new Date().toISOString()
    };
    
    // Save notification to database
    const notification = new Notification({
      message,
      type: 'emergency',
      additionalData,
      timestamp: new Date(),
      expiresAt,
      responses: [] // Store user responses
    });
    
    await notification.save();
    
    let activeSocketCount = 0;
    
    // Send to all active sockets
    sockets.forEach(socket => {
      if (socket.connected) {
        socket.emit('notification', {
          message,
          type: 'emergency',
          additionalData,
          id: notification._id
        });
        activeSocketCount++;
      }
    });
    
    res.json({
      msg: 'Emergency blood request sent',
      recipients: activeSocketCount,
      notification: {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        additionalData: notification.additionalData,
        timestamp: notification.timestamp
      }
    });
  } catch (error) {
    console.error('Error sending blood request:', error);
    res.status(500).json({ error: 'Failed to send blood request' });
  }
};

// Handle user responses to blood requests
exports.respondToBloodRequest = async (req, res) => {
  try {
    const { notificationId, response, userId, userName, contactInfo } = req.body;
    
    if (!notificationId || !response) {
      return res.status(400).json({ error: 'Notification ID and response are required' });
    }
    
    // Find the notification in the database
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Add the response to the notification
    if (!notification.responses) {
      notification.responses = [];
    }
    
    notification.responses.push({
      userId,
      userName,
      response, // 'yes' or 'no'
      contactInfo,
      timestamp: new Date()
    });
    
    await notification.save();
    
    // If the response is positive, notify the requester
    if (response === 'yes' && notification.additionalData && notification.additionalData.contactNumber) {
      // In a real system, you might send an SMS or email to the requester
      console.log(`Positive response to blood request. Notifying requester at ${notification.additionalData.contactNumber}`);
    }
    
    res.json({
      msg: 'Response recorded',
      notificationId,
      response
    });
  } catch (error) {
    console.error('Error responding to blood request:', error);
    res.status(500).json({ error: 'Failed to record response' });
  }
};

// Get all active notifications (not expired)
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      expiresAt: { $gt: new Date() }
    }).sort({ timestamp: -1 });
    
    res.json({
      notifications: notifications.map(notif => ({
        id: notif._id,
        message: notif.message,
        type: notif.type || 'general',
        additionalData: notif.additionalData || {},
        timestamp: notif.timestamp.toLocaleTimeString(),
        date: notif.timestamp.toISOString(),
        responses: notif.responses || []
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get emergency blood requests only
exports.getEmergencyBloodRequests = async (req, res) => {
  try {
    const notifications = await Notification.find({
      type: 'emergency',
      expiresAt: { $gt: new Date() }
    }).sort({ timestamp: -1 });
    
    res.json({
      emergencyRequests: notifications.map(notif => ({
        id: notif._id,
        message: notif.message,
        additionalData: notif.additionalData || {},
        timestamp: notif.timestamp.toLocaleTimeString(),
        date: notif.timestamp.toISOString(),
        responses: notif.responses || []
      }))
    });
  } catch (error) {
    console.error('Error fetching emergency requests:', error);
    res.status(500).json({ error: 'Failed to fetch emergency requests' });
  }
};

// Delete expired notifications - to be used by the cronjob
exports.cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lte: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    throw error;
  }
};