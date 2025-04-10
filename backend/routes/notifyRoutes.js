const express = require('express');
const { sendReminder } = require('../controller/notifyController');
const router = express.Router();

router.post('/send', sendReminder);

module.exports = router;
