const express = require('express');
const {
  sendReminder,
  getAllNotifications,
  sendBloodRequest,
  respondToBloodRequest,
  getEmergencyBloodRequests
} = require('../controller/notifyController');
const router = express.Router();

// Route to send a new general notification
router.post('/send', sendReminder);

// Route to send emergency blood request notification
router.post('/blood-request', sendBloodRequest);

// Route to respond to a blood request
router.post('/respond', respondToBloodRequest);

// Route to get all active notifications
router.get('/all', getAllNotifications);

// Route to get only emergency blood requests
router.get('/emergency', getEmergencyBloodRequests);

module.exports = router;