const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',required:true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Center' ,required:true},
  time: String,
  date: String,
  confirmed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slot', slotSchema);