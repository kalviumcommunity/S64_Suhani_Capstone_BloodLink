// models/Notification.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  response: {
    type: String,
    enum: ['yes', 'no'],
    required: true
  },
  contactInfo: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'emergency', 'announcement', 'reminder'],
    default: 'general'
  },
  additionalData: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // The date when this notification should expire
  expiresAt: {
    type: Date,
    required: true
  },
  // Store responses for interactive notifications (like blood donation requests)
  responses: [responseSchema],
  // Track notification status
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  }
});

// Index for faster queries on common fields
notificationSchema.index({ type: 1, expiresAt: 1 });
notificationSchema.index({ status: 1 });

// Virtual property to check if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

// Virtual property to count positive responses
notificationSchema.virtual('positiveResponses').get(function() {
  if (!this.responses) return 0;
  return this.responses.filter(r => r.response === 'yes').length;
});

// Middleware to automatically mark notification as expired
notificationSchema.pre('find', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

// Correct way to define the model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;