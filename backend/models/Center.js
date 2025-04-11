const mongoose = require('mongoose');

const centerSchema = new mongoose.Schema({
  name: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
  availableSlots: Number,
});

module.exports = mongoose.model('Center', centerSchema);
