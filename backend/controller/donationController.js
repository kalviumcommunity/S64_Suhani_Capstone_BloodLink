const Razorpay = require('razorpay');
const crypto = require('crypto');

// IMPORTANT: Replace these with your actual Razorpay test keys from your dashboard
// Test mode keys start with 'rzp_test_' and 'YOUR_TEST_SECRET'
const RAZORPAY_KEY_ID = '';
const RAZORPAY_KEY_SECRET = '';

// Initialize Razorpay with test keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET
});

// Create a new Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Please provide a valid positive number.'
      });
    }
    
    console.log(`Creating order with amount: ${amount} paise`);
    
    const options = {
      amount: amount, // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
      payment_capture: 1 // auto capture
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      console.error('Order creation failed');
      return res.status(500).json({
        success: false,
        message: 'Error creating order'
      });
    }

    console.log('Order created successfully:', order);
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating order'
    });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    if (!orderCreationId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }
    
    console.log('Verifying payment:', {
      orderCreationId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature.substring(0, 10) + '...' // Log partial signature for security
    });

    // Creating hmac object 
    const secret = process.env.RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac('sha256', secret);

    // Passing the data to be hashed
    hmac.update(orderCreationId + '|' + razorpayPaymentId);
    
    // Creating the hmac in the required format
    const generated_signature = hmac.digest('hex');
    
    console.log('Signature verification:', {
      matches: razorpaySignature === generated_signature
    });
    
    // Checking if the generated signature and the signature received from Razorpay are the same
    if (razorpaySignature === generated_signature) {
      // Save donation details to your database here
      // For testing, we just log the successful payment
      console.log('Payment verified successfully!');
      
      return res.json({
        success: true,
        msg: 'Payment has been verified and donation recorded. Thank you for your contribution!'
      });
    } else {
      console.error('Payment signature verification failed');
      return res.status(400).json({
        success: false,
        msg: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      msg: error.message || 'Internal Server Error'
    });
  }
}; 