const Slot = require('../models/Slot');

// Book a slot
exports.bookSlot = async (req, res) => {
  const { userId, centerId, time, date, userConfirmedEligibility } = req.body;

  try {
    const existingSlot = await Slot.findOne({ centerId, date, time });

    if (existingSlot) {
      return res.status(400).json({ 
        success: false,
        error: 'This time slot is already booked. Please select another time.' 
      });
    }

    const slot = new Slot({ 
      // userId, 
      // centerId, 
      userId: req.body.userId, // Ensure this exists in your request
      centerId: req.body.centerId, // Ensure this is a valid ObjectId string
      time, 
      date,
      confirmed: typeof userConfirmedEligibility === 'boolean' ? userConfirmedEligibility : true
    });

    const savedSlot = await slot.save();

    res.status(201).json({ 
      success: true, 
      message: 'Slot booked successfully', 
      _id: savedSlot._id,
      slot: savedSlot
    });
  } catch (err) {
    console.error('Slot booking error:', err);
    res.status(500).json({ success: false, error: 'Booking failed' });
  }
};

// Confirm a booked slot
exports.confirmSlot = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const { userConfirmedEligibility } = req.body;

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (slot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized to confirm this booking' });
    }

    slot.confirmed = userConfirmedEligibility;
    await slot.save();

    res.json({ success: true, message: 'Booking confirmed successfully', slot });
  } catch (err) {
    console.error('Confirm slot error:', err);
    res.status(500).json({ success: false, error: 'Failed to confirm booking' });
  }
};

// Get all user slots
exports.getUserSlots = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const slots = await Slot.find({ userId }).populate('centerId');
    res.json({ success: true, slots });
  } catch (err) {
    console.error('Get user slots error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch slots' });
  }
};

// Get all center slots
exports.getSlotsByCenter = async (req, res) => {
  try {
    const centerId = req.params.centerId;
    const slots = await Slot.find({ centerId }).populate('userId');
    res.json({ success: true, slots });
  } catch (err) {
    console.error('Get center slots error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch slots' });
  }
};
// Get available slots for a center on a specific date
exports.getAvailableSlots = async (req, res) => {
  try {
    const { centerId, date } = req.params;
    
    // Define all possible time slots
    const allTimeSlots = [
      "09:00 AM", "10:00 AM", "11:00 AM", 
      "12:00 PM", "01:00 PM", "02:00 PM",
      "03:00 PM", "04:00 PM", "05:00 PM"
    ];
    
    // Find booked slots for the center and date
    const bookedSlots = await Slot.find({ centerId, date }).select('time');
    
    // Extract the times that are already booked
    const bookedTimes = bookedSlots.map(slot => slot.time);
    
    // Filter out the booked times to get available times
    const availableSlots = allTimeSlots.filter(time => !bookedTimes.includes(time));
    
    res.json({
      success: true,
      availableSlots
    });
  } catch (err) {
    console.error('Get available slots error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch available slots' });
  }
};
