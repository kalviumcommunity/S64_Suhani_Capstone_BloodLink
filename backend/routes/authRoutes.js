const express = require('express');
const { register, login } = require('../controller/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
