// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController'); // Make sure path is correct
const Donor = require('../models/Donor'); // Add this import
// AI routes
router.post('/donor/create', aiController.createDonor);
router.get('/donor/eligibility/:donorId', aiController.checkDonorEligibility);
router.get('/donors/compatible/:bloodType', aiController.findCompatibleDonors);
router.get('/inventory/predict', aiController.predictInventoryNeeds);
router.get('/suggest/donors/:bloodType', aiController.suggestDonorsToContact);
router.post('/ai/inventory/seed', aiController.seedInventoryData);
module.exports = router;