const express = require('express');
const { bookSlot, getUserSlots, getSlotsByCenter, confirmSlot,getAvailableSlots  } = require('../controller/slotController');


const router = express.Router();

// Book a slot (Protected)

router.post('/book',  bookSlot);

// Confirm a slot that was already booked (Protected)
router.put('/:slotId/confirm', confirmSlot);

// Get all slots for a center

router.get('/center/:centerId', getSlotsByCenter);

// Get user's booked slots (Protected)

router.get('/user/:userId',  getUserSlots);
// In slotRoutes.js

router.get('/available/:centerId/:date', getAvailableSlots);


module.exports = router;