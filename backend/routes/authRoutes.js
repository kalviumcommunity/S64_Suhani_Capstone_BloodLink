// authRoutes.js
const express = require('express');
const { register, login } = require('../controller/authController');
const { googleLogin } = require('../controller/googleController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { authLimiter, apiLimiter } = require('../middleware/rateLimitMiddleware');
// Public routes
router.use(apiLimiter);
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);

// Protected route example
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ userId: req.user });
});

module.exports = router;