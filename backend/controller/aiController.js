// controllers/aiController.js
const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const DonationRequest = require('../models/DonationRequest');

// Blood type compatibility chart
const bloodCompatibility = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};
// aiController.js
exports.createDonor = async (req, res) => {
    try {
      const donorData = req.body;
      const donor = new Donor(donorData);
      await donor.save(); // 💾 save to MongoDB
      return res.status(201).json({ message: 'Donor created successfully', donor });
    } catch (error) {
      console.error('Error creating donor:', error);
      return res.status(500).json({ error: error.message });
    }
  };
  
  
// AI Assistant functions
exports.checkDonorEligibility = async (req, res) => {
  try {
    const { donorId } = req.params;
    const donor = await Donor.findById(donorId);
    
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    
    const currentDate = new Date();
    const eligibilityResult = checkEligibility(donor, currentDate);
    
    return res.json(eligibilityResult);
  } catch (err) {
    console.error('Error checking eligibility:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Find compatible donors for a blood type
exports.findCompatibleDonors = async (req, res) => {
  try {
    const { bloodType } = req.params;
    
    // Validate blood type
    if (!bloodCompatibility[bloodType]) {
      return res.status(400).json({ error: 'Invalid blood type' });
    }
    
    const compatibleTypes = bloodCompatibility[bloodType];
    
    // Find eligible donors with compatible blood types
    const currentDate = new Date();
    const donors = await Donor.find({
      bloodType: { $in: compatibleTypes },
      eligibleToDonateSince: { $lte: currentDate }
    }).select('name bloodType phone email lastDonation');
    
    return res.json({
      requestedBloodType: bloodType,
      compatibleTypes,
      compatibleDonors: donors
    });
  } catch (err) {
    console.error('Error finding compatible donors:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Predict inventory needs based on historical data
exports.predictInventoryNeeds = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get current inventory
    const currentInventory = await BloodInventory.find();
    
    // Get historical requests to calculate average daily usage
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const requests = await DonationRequest.find({
      requestDate: { $gte: threeMonthsAgo }
    });
    
    // Calculate daily usage by blood type
    const bloodTypeUsage = calculateDailyUsage(requests);
    
    // Predict needs and shortages
    const prediction = predictNeeds(currentInventory, bloodTypeUsage, days);
    
    return res.json(prediction);
  } catch (err) {
    console.error('Error predicting inventory:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Suggest donors to contact based on need and priority
exports.suggestDonorsToContact = async (req, res) => {
  try {
    const { bloodType } = req.params;
    
    // Get compatible donors
    const compatibleTypes = bloodCompatibility[bloodType];
    
    // Find eligible donors and sort by priority
    const currentDate = new Date();
    const compatibleDonors = await Donor.find({
      bloodType: { $in: compatibleTypes },
      eligibleToDonateSince: { $lte: currentDate }
    });
    
    // Sort and prioritize donors
    const prioritizedDonors = prioritizeDonors(compatibleDonors, bloodType);
    
    return res.json({
      bloodTypeNeeded: bloodType,
      suggestedDonors: prioritizedDonors.slice(0, 20) // Return top 20
    });
  } catch (err) {
    console.error('Error suggesting donors:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
// Seed Inventory Data - AI feature
exports.seedInventoryData = async (req, res) => {
    try {
      const seedData = [
        { bloodType: "A+", units: 12 },
        { bloodType: "A-", units: 7 },
        { bloodType: "B+", units: 10 },
        { bloodType: "B-", units: 5 },
        { bloodType: "AB+", units: 3 },
        { bloodType: "AB-", units: 2 },
        { bloodType: "O+", units: 15 },
        { bloodType: "O-", units: 8 }
      ];
  
      // Clean previous inventory
      await BloodInventory.deleteMany({});
  
      // Insert new seed data
      await BloodInventory.insertMany(seedData);
  
      return res.status(201).json({ message: 'Inventory seeded successfully by AI Assistant!' });
    } catch (error) {
      console.error('Error seeding inventory:', error);
      return res.status(500).json({ error: 'Server error during inventory seeding' });
    }
  };
  

// Helper function for checking eligibility
function checkEligibility(donor, currentDate) {
  // Rule 1: Last donation must be at least 56 days ago
  if (donor.lastDonation) {
    const daysSinceLastDonation = Math.floor((currentDate - donor.lastDonation) / (1000 * 60 * 60 * 24));
    if (daysSinceLastDonation < 56) {
      return {
        eligible: false,
        reason: `Only ${daysSinceLastDonation} days since last donation. Must wait 56 days.`,
        eligibleOn: new Date(donor.lastDonation.getTime() + (56 * 24 * 60 * 60 * 1000))
      };
    }
  }
  
  // Rule 2: Check for disqualifying medical conditions
  const disqualifyingConditions = ['hepatitis', 'hiv', 'recent surgery', 'anemia'];
  for (const condition of donor.medicalConditions || []) {
    if (disqualifyingConditions.includes(condition.toLowerCase())) {
      return {
        eligible: false,
        reason: `Medical condition '${condition}' prevents donation`,
        eligibleOn: null // Permanent disqualification
      };
    }
  }
  
  return {
    eligible: true,
    reason: 'Donor is eligible to donate',
    eligibleOn: currentDate
  };
}

// Calculate average daily usage by blood type
function calculateDailyUsage(requests) {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const usage = {};
  
  bloodTypes.forEach(type => {
    const typeRequests = requests.filter(req => req.bloodType === type);
    const totalUnits = typeRequests.reduce((sum, req) => sum + req.unitsNeeded, 0);
    // Calculate average daily usage over 90 days
    usage[type] = totalUnits / 90;
  });
  
  return usage;
}

// Predict needs and potential shortages
function predictNeeds(inventory, dailyUsage, days) {
  const prediction = {
    currentInventory: {},
    predictedUsage: {},
    predictedShortage: {},
    recommendedDonations: {}
  };
  
  inventory.forEach(item => {
    const bloodType = item.bloodType;
    prediction.currentInventory[bloodType] = item.units;
    prediction.predictedUsage[bloodType] = Math.ceil(dailyUsage[bloodType] * days);
    
    const projectedRemaining = item.units - prediction.predictedUsage[bloodType];
    if (projectedRemaining < 0) {
      prediction.predictedShortage[bloodType] = Math.abs(projectedRemaining);
      prediction.recommendedDonations[bloodType] = Math.ceil(Math.abs(projectedRemaining) * 1.2); // 20% buffer
    } else {
      prediction.predictedShortage[bloodType] = 0;
      prediction.recommendedDonations[bloodType] = 0;
    }
  });
  
  return prediction;
}

// Prioritize donors based on various factors
function prioritizeDonors(donors, neededBloodType) {
  // Score each donor based on multiple factors
  const scoredDonors = donors.map(donor => {
    let score = 0;
    
    // Factor 1: Direct match gets higher priority than compatible match
    if (donor.bloodType === neededBloodType) {
      score += 20;
    }
    
    // Factor 2: Time since last donation (higher = more likely to donate)
    const daysSinceLastDonation = donor.lastDonation 
      ? Math.floor((new Date() - donor.lastDonation) / (1000 * 60 * 60 * 24))
      : 365; // Assume 1 year if never donated
    
    // Donors who donated 3-6 months ago are ideal
    if (daysSinceLastDonation >= 90 && daysSinceLastDonation <= 180) {
      score += 15;
    } else if (daysSinceLastDonation > 180) {
      score += 10;
    } else {
      score += 5; // Recently donated but eligible
    }
    
    // Factor 3: Donation history (frequent donors more likely to respond)
    score += Math.min((donor.donationHistory?.length || 0) * 2, 15);
    
    return {
      donor: {
        id: donor._id,
        name: donor.name,
        bloodType: donor.bloodType,
        phone: donor.phone,
        email: donor.email,
        lastDonation: donor.lastDonation
      },
      score
    };
  });
  
  // Sort by score (highest first)
  return scoredDonors.sort((a, b) => b.score - a.score);
}