const express = require('express');
const router = express.Router();
const donationController = require('../controller/donationController');

// Route to create a Razorpay order
router.post('/create-order', donationController.createOrder);

// Route to verify Razorpay payment
router.post('/verify-payment', donationController.verifyPayment);

module.exports = router; 