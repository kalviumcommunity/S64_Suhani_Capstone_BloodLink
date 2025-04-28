const mongoose = require('mongoose');
const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  lastDonation: {
    type: Date,
    default: null
  },
  donationHistory: [{
    type: Date
  }],
  eligibleToDonateSince: {
    type: Date,
    default: Date.now
  },
  medicalConditions: [{
    type: String
  }]
});
// Add a pre-save hook to calculate eligibility date
donorSchema.pre('save', function(next) {
  // If there's a lastDonation date, calculate eligibility (56 days after last donation)
  if (this.lastDonation) {
    const eligibilityDate = new Date(this.lastDonation);
    eligibilityDate.setDate(eligibilityDate.getDate() + 56); // 56 days (8 weeks) after donation
    this.eligibleToDonateSince = eligibilityDate;}
  next();
});
module.exports = mongoose.model('Donor', donorSchema);