const Slot = require('../models/Slot');

exports.bookSlot = async (req, res) => {
  const { userId, centerId, time, date } = req.body;
  try {
    const slot = new Slot({ userId, centerId, time, date });
    await slot.save();
    res.json({ msg: 'Slot booked' });
  } catch (err) {
    res.status(500).json({ error: 'Booking failed' });
  }
};

exports.getUserSlots = async (req, res) => {
  const userId = req.params.userId;
  const slots = await Slot.find({ userId }).populate('centerId');
  res.json(slots);
};
// ✅ New: Get all slots for a center
exports.getSlotsByCenter = async (req, res) => {
    try {
      const centerId = req.params.centerId;
      const slots = await Slot.find({ centerId }).populate('userId');
      res.json(slots);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch slots' });
    }
  };
  