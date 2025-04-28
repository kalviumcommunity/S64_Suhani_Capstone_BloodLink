// models/BloodInventory.js
const mongoose = require('mongoose');

const BloodInventorySchema = new mongoose.Schema({
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
    unique: true
  },
  units: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expirationDates: [{
    units: Number,
    expiresOn: Date
  }]
});

module.exports = mongoose.model('BloodInventory', BloodInventorySchema);
