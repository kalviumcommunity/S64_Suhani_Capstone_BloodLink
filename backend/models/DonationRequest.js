// models/DonationRequest.js
const mongoose = require('mongoose');

const DonationRequestSchema = new mongoose.Schema({
  patientName: String,
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsNeeded: {
    type: Number,
    required: true
  },
  hospital: String,
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'partial', 'cancelled'],
    default: 'pending'
  }
});

module.exports = mongoose.model('DonationRequest', DonationRequestSchema);