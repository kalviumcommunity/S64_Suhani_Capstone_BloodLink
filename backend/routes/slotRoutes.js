
const express = require('express');
const { bookSlot, getUserSlots, getSlotsByCenter } = require('../controller/slotController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/book', authMiddleware, bookSlot);
router.get('/center/:centerId', getSlotsByCenter);
router.get('/user/:userId', authMiddleware, getUserSlots);

module.exports = router;
