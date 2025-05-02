// routes/langchainRoutes.js
const express = require('express');
const router = express.Router();
const langchainController = require('../controller/langchainController'); 

// LangChain enhanced routes
router.get('/donor-match/:requestId', langchainController.smartDonorMatch);
router.get('/appeal/:donorId/:requestId', langchainController.generateDonationAppeal);
router.get('/forecast/explain', langchainController.explainableInventoryForecast);
router.get('/engagement/:donorId', langchainController.donorEngagementStrategy);

module.exports = router;