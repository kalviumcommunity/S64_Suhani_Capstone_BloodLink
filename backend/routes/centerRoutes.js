// backend/routes/centerRoutes.js
const express = require('express');
const router = express.Router();
const { getNearbyCenters, searchCentersByPlace } = require('../controller/centerController');

// Route: /api/centers/nearby?lat=...&lng=...
router.get('/nearby', getNearbyCenters);

// Route: /api/centers/search?query=cityname
router.get('/search', searchCentersByPlace);

module.exports = router;


