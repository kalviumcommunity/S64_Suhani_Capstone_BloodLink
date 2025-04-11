const mongoose = require('mongoose');
const slotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' },
  time: String,
  date: String,
});

module.exports = mongoose.model('Slot', slotSchema);
