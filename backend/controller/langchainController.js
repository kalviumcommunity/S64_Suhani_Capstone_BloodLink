// backend/controller/langchainController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const DonationRequest = require('../models/DonationRequest');

// =====================================================
// GEMINI INITIALIZATION
// =====================================================

let genAI;

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set');
} else {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini initialized');
}

// =====================================================
// CONFIG
// =====================================================

// Change these if needed
const PRIMARY_MODEL = 'gemini-3.7-flash';

// Add fallback models if available for your API key
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash'
];

const MAX_RETRIES = 4;
const INITIAL_DELAY = 2000;

// =====================================================
// PREVENT MULTIPLE SIMULTANEOUS REQUESTS
// =====================================================

let activeGeminiRequests = 0;
const MAX_CONCURRENT_REQUESTS = 1;

async function waitForGeminiSlot() {
  while (activeGeminiRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Waiting for active Gemini request to finish...');
    await sleep(1000);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =====================================================
// GEMINI REQUEST WITH RETRIES
// =====================================================

async function generateGeminiContent(prompt) {
  if (!genAI) {
    throw new Error('Gemini API is not initialized. Check GEMINI_API_KEY.');
  }

  const models = [
    PRIMARY_MODEL,
    ...FALLBACK_MODELS
  ];

  await waitForGeminiSlot();

  activeGeminiRequests++;

  try {
    let lastError;

    for (const modelName of models) {

      console.log(`\n🤖 Trying Gemini model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName
      });

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

        try {
          console.log(
            `🚀 Gemini request | Model: ${modelName} | Attempt: ${attempt}/${MAX_RETRIES}`
          );

          const result = await model.generateContent(prompt);

          if (!result || !result.response) {
            throw new Error('No response received from Gemini');
          }

          const text = result.response.text();

          if (!text) {
            throw new Error('Gemini returned an empty response');
          }

          console.log(
            `✅ Gemini response successful | Model: ${modelName}`
          );

          return text;

        } catch (error) {

          lastError = error;

          const status = error.status;

          console.error(
            `❌ Gemini error | Model: ${modelName} | Attempt: ${attempt}`,
            error.message
          );

          // Don't retry invalid API key
          if (status === 401 || status === 403) {
            throw error;
          }

          // Retry 429 / 500 / 503
          const shouldRetry =
            status === 429 ||
            status === 500 ||
            status === 502 ||
            status === 503 ||
            status === 504;

          if (!shouldRetry) {
            break;
          }

          if (attempt < MAX_RETRIES) {

            const exponentialDelay =
              INITIAL_DELAY * Math.pow(2, attempt - 1);

            const randomJitter =
              Math.floor(Math.random() * 1500);

            const delay =
              exponentialDelay + randomJitter;

            console.log(
              `⏳ Gemini busy. Retrying in ${delay}ms...`
            );

            await sleep(delay);
          }
        }
      }

      console.log(
        `⚠️ Model ${modelName} failed. Trying next model...`
      );
    }

    throw lastError || new Error('All Gemini models failed');

  } finally {
    activeGeminiRequests--;

    console.log(
      `🔓 Gemini request finished. Active requests: ${activeGeminiRequests}`
    );
  }
}

// =====================================================
// 1. SMART DONOR MATCHING
// =====================================================

exports.smartDonorMatch = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request =
      await DonationRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Donation request not found'
      });
    }

    const compatibleTypes =
      getCompatibleBloodTypes(request.bloodType);

    const eligibleDonors =
      await Donor.find({
        bloodType: {
          $in: compatibleTypes
        },
        eligibleToDonateSince: {
          $lte: new Date()
        }
      }).limit(50);

    if (eligibleDonors.length === 0) {
      return res.json({
        message: 'No eligible donors found',
        recommendations: []
      });
    }

    // Create deterministic scores first
    const recommendations =
      eligibleDonors
        .map(donor => {

          const donationCount =
            donor.donationHistory?.length || 0;

          const daysSinceLastDonation =
            donor.lastDonation
              ? Math.floor(
                  (new Date() - donor.lastDonation) /
                  (1000 * 60 * 60 * 24)
                )
              : 999;

          let priorityScore = 0;

          // Exact blood type gets priority
          if (donor.bloodType === request.bloodType) {
            priorityScore += 50;
          } else {
            priorityScore += 30;
          }

          // Donation experience
          priorityScore +=
            Math.min(donationCount * 5, 25);

          // More time since last donation
          priorityScore +=
            Math.min(
              Math.floor(daysSinceLastDonation / 10),
              25
            );

          return {
            donor,
            priorityScore
          };
        })
        .sort(
          (a, b) =>
            b.priorityScore - a.priorityScore
        )
        .slice(0, 5);

    const result =
      recommendations.map(item => ({
        donorId: item.donor._id,
        priorityScore: item.priorityScore,
        reasonForSelection:
          `${item.donor.bloodType} compatible donor with ` +
          `${item.donor.donationHistory?.length || 0} previous donations.`,
        contactStrategy:
          request.urgency === 'critical'
            ? 'Call immediately and follow up with SMS.'
            : 'Send SMS notification and follow up if needed.',
        donor: {
          _id: item.donor._id,
          name: item.donor.name,
          bloodType: item.donor.bloodType,
          phone: item.donor.phone,
          email: item.donor.email,
          lastDonation: item.donor.lastDonation
        }
      }));

    return res.json({
      requestDetails: request,
      recommendations: result
    });

  } catch (error) {

    console.error(
      'Error in smart donor matching:',
      error
    );

    return res.status(500).json({
      error:
        'Server error during smart donor matching'
    });
  }
};

// =====================================================
// 2. DONATION APPEAL GENERATOR
// =====================================================

exports.generateDonationAppeal =
async (req, res) => {

  try {

    const { donorId, requestId } =
      req.params;

    const donor =
      await Donor.findById(donorId);

    const request =
      await DonationRequest.findById(requestId);

    if (!donor || !request) {

      return res.status(404).json({
        error:
          !donor
            ? 'Donor not found'
            : 'Donation request not found'
      });
    }

    const inventory =
      await BloodInventory.findOne({
        bloodType: request.bloodType
      });

    const currentStock =
      inventory ? inventory.units : 0;

    const criticality =
      getCriticalityLevel(
        currentStock,
        request.unitsNeeded
      );

    const prompt = `
Generate a personalized blood donation appeal.

DONOR:
Name: ${donor.name}
Blood Type: ${donor.bloodType}
Previous Donations: ${donor.donationHistory?.length || 0}

REQUEST:
Blood Type Needed: ${request.bloodType}
Units Needed: ${request.unitsNeeded}
Urgency: ${request.urgency}
Current Stock: ${currentStock}
Criticality: ${criticality}

Return exactly in this format:

SMS:
[text]

EMAIL SUBJECT:
[text]

EMAIL BODY:
[text]
`;

    let generatedText;

    try {
      generatedText =
        await generateGeminiContent(prompt);

    } catch (error) {

      console.error(
        'Gemini failed, using fallback appeal'
      );

      generatedText = `
SMS:
Hi ${donor.name}, there is a ${request.urgency} need for ${request.bloodType} compatible blood. Your donation could help save a life.

EMAIL SUBJECT:
Urgent Blood Donation Request

EMAIL BODY:
Dear ${donor.name},

There is currently a ${request.urgency} requirement for blood compatible with your ${donor.bloodType} blood type.

The blood bank currently requires ${request.unitsNeeded} units.

If you are eligible and available, please consider donating.

Thank you for helping save lives.
`;
    }

    const appeal =
      parseAppealContent(generatedText);

    return res.json({
      donorId: donor._id,
      donorName: donor.name,
      requestId: request._id,
      appeal
    });

  } catch (error) {

    console.error(
      'Error generating donation appeal:',
      error
    );

    return res.status(500).json({
      error:
        'Server error during appeal generation'
    });
  }
};

// =====================================================
// 3. EXPLAINABLE INVENTORY FORECAST
// =====================================================

exports.explainableInventoryForecast =
async (req, res) => {

  try {

    const days =
      Math.max(
        1,
        Math.min(
          Number(req.query.days) || 30,
          365
        )
      );

    console.log(
      `\n📊 Generating ${days}-day inventory forecast...`
    );

    // ---------------------------------------------
    // GET INVENTORY
    // ---------------------------------------------

    let inventoryData =
      await BloodInventory.find();

    if (
      !inventoryData ||
      inventoryData.length === 0
    ) {

      console.log(
        '⚠️ No inventory found. Using mock data.'
      );

      inventoryData = [
        { bloodType: 'A+', units: 100 },
        { bloodType: 'A-', units: 50 },
        { bloodType: 'B+', units: 75 },
        { bloodType: 'B-', units: 40 },
        { bloodType: 'AB+', units: 30 },
        { bloodType: 'AB-', units: 20 },
        { bloodType: 'O+', units: 120 },
        { bloodType: 'O-', units: 60 }
      ];
    }

    // ---------------------------------------------
    // GET REQUEST HISTORY
    // ---------------------------------------------

    const threeMonthsAgo =
      new Date();

    threeMonthsAgo.setMonth(
      threeMonthsAgo.getMonth() - 3
    );

    let requests =
      await DonationRequest.find({
        requestDate: {
          $gte: threeMonthsAgo
        }
      });

    if (
      !requests ||
      requests.length === 0
    ) {

      console.log(
        '⚠️ No requests found. Using mock data.'
      );

      requests = [
        {
          bloodType: 'A+',
          unitsNeeded: 20,
          urgency: 'high',
          requestDate: new Date()
        },
        {
          bloodType: 'O-',
          unitsNeeded: 15,
          urgency: 'critical',
          requestDate: new Date()
        },
        {
          bloodType: 'B+',
          unitsNeeded: 10,
          urgency: 'medium',
          requestDate: new Date()
        },
        {
          bloodType: 'AB+',
          unitsNeeded: 5,
          urgency: 'low',
          requestDate: new Date()
        }
      ];
    }

    // ---------------------------------------------
    // CALCULATE USAGE
    // ---------------------------------------------

    const bloodTypeUsage =
      calculateDailyUsage(requests);

    // ---------------------------------------------
    // QUANTITATIVE FORECAST
    // ---------------------------------------------

    const quantitativePrediction =
      predictNeeds(
        inventoryData,
        bloodTypeUsage,
        days
      );

    // ---------------------------------------------
    // PREPARE GEMINI DATA
    // ---------------------------------------------

    const currentInventoryText =
      Object.entries(
        quantitativePrediction.currentInventory
      )
        .map(
          ([bloodType, units]) =>
            `${bloodType}: ${units} units`
        )
        .join('\n');

    const usageText =
      Object.entries(
        quantitativePrediction.predictedUsage
      )
        .map(
          ([bloodType, units]) =>
            `${bloodType}: predicted usage ${units} units`
        )
        .join('\n');

    const shortageText =
      Object.entries(
        quantitativePrediction.predictedShortage
      )
        .filter(
          ([, shortage]) =>
            shortage > 0
        )
        .map(
          ([bloodType, shortage]) =>
            `${bloodType}: shortage of ${shortage} units`
        )
        .join('\n') ||
      'No shortages predicted';

    const prompt = `
You are an AI assistant for a blood bank.

Analyze this ${days}-day blood inventory forecast.

CURRENT INVENTORY:
${currentInventoryText}

PREDICTED USAGE:
${usageText}

PREDICTED SHORTAGES:
${shortageText}

Provide:

1. Executive summary
2. Blood types at risk
3. Explanation of expected usage
4. Recommended actions
5. Donation priorities

Keep the response concise and useful for blood bank staff.
`;

    // ---------------------------------------------
    // CALL GEMINI
    // ---------------------------------------------

    let explainableForecast;
    let aiAvailable = true;

    try {

      console.log(
        '🤖 Generating explainable forecast...'
      );

      explainableForecast =
        await generateGeminiContent(prompt);

    } catch (error) {

      console.error(
        '⚠️ Gemini unavailable. Using local forecast explanation.'
      );

      aiAvailable = false;

      explainableForecast =
        generateLocalForecastExplanation(
          quantitativePrediction,
          days
        );
    }

    // ---------------------------------------------
    // RETURN RESPONSE
    // ---------------------------------------------

    return res.json({

      success: true,

      quantitativeForecast:
        quantitativePrediction,

      explainableForecast,

      aiAvailable,

      daysForecasted: days,

      analysisDate:
        new Date()

    });

  } catch (error) {

    console.error(
      'Error generating explainable forecast:',
      error
    );

    return res.status(500).json({

      success: false,

      error:
        'Server error during forecast generation',

      details:
        error.message

    });
  }
};

// =====================================================
// 4. DONOR ENGAGEMENT STRATEGY
// =====================================================

exports.donorEngagementStrategy =
async (req, res) => {

  try {

    const { donorId } =
      req.params;

    const donor =
      await Donor.findById(donorId);

    if (!donor) {

      return res.status(404).json({
        error:
          'Donor not found'
      });
    }

    const donationCount =
      donor.donationHistory?.length || 0;

    const daysSinceLastDonation =
      donor.lastDonation
        ? Math.floor(
            (new Date() -
              new Date(donor.lastDonation)) /
            (1000 * 60 * 60 * 24)
          )
        : 'Never donated';

    const prompt = `
Create a donor engagement strategy.

DONOR:
Name: ${donor.name}
Blood Type: ${donor.bloodType}
Previous Donations: ${donationCount}
Days Since Last Donation: ${daysSinceLastDonation}

Provide:

1. Donor profile
2. Recommended approach
3. Best communication channel
4. Suggested timing
5. Key messages
6. Potential barriers
7. Long-term engagement strategy
`;

    let strategy;

    try {

      strategy =
        await generateGeminiContent(prompt);

    } catch (error) {

      strategy = {
        donorProfile:
          `${donor.name} has ${donationCount} previous donations.`,
        recommendedApproach:
          'Use personalized and appreciative communication.',
        communicationChannels: [
          {
            channel: 'SMS',
            rationale:
              'Quick and direct communication.',
            timing:
              'During normal daytime hours.'
          }
        ],
        keyMessages: [
          'Your donation can save lives.',
          'Your blood type is valuable.'
        ],
        potentialBarriers: [
          'Availability',
          'Donation eligibility'
        ],
        longTermEngagement:
          'Send periodic reminders and thank-you messages.'
      };
    }

    return res.json({

      donorId: donor._id,

      donorName: donor.name,

      bloodType: donor.bloodType,

      engagementStrategy:
        strategy

    });

  } catch (error) {

    console.error(
      'Error generating engagement strategy:',
      error
    );

    return res.status(500).json({
      error:
        'Server error during strategy generation'
    });
  }
};

// =====================================================
// LOCAL FORECAST FALLBACK
// =====================================================

function generateLocalForecastExplanation(
  forecast,
  days
) {

  const shortages =
    Object.entries(
      forecast.predictedShortage
    )
      .filter(
        ([, shortage]) =>
          shortage > 0
      );

  let explanation =
    `EXECUTIVE SUMMARY\n\n`;

  explanation +=
    `This forecast analyzes expected blood inventory needs over the next ${days} days.\n\n`;

  if (shortages.length === 0) {

    explanation +=
      `No blood shortages are currently predicted based on the available inventory and historical demand.\n\n`;

  } else {

    explanation +=
      `The following blood types may experience shortages:\n\n`;

    shortages.forEach(
      ([bloodType, shortage]) => {

        explanation +=
          `• ${bloodType}: approximately ${shortage} units short\n`;
      }
    );
  }

  explanation +=
    `\nRECOMMENDED ACTIONS\n\n`;

  Object.entries(
    forecast.recommendedDonations
  )
    .filter(
      ([, units]) =>
        units > 0
    )
    .forEach(
      ([bloodType, units]) => {

        explanation +=
          `• Prioritize donor outreach for ${bloodType}. Target at least ${units} additional units.\n`;
      }
    );

  if (shortages.length === 0) {

    explanation +=
      `• Continue regular donor engagement.\n`;

    explanation +=
      `• Monitor inventory levels daily.\n`;

    explanation +=
      `• Maintain a safety buffer for rare blood types.\n`;
  }

  return explanation;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getCompatibleBloodTypes(
  receiverBloodType
) {

  const bloodCompatibility = {

    'A+':
      ['A+', 'A-', 'O+', 'O-'],

    'A-':
      ['A-', 'O-'],

    'B+':
      ['B+', 'B-', 'O+', 'O-'],

    'B-':
      ['B-', 'O-'],

    'AB+':
      [
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-'
      ],

    'AB-':
      [
        'A-',
        'B-',
        'AB-',
        'O-'
      ],

    'O+':
      [
        'O+',
        'O-'
      ],

    'O-':
      [
        'O-'
      ]
  };

  return bloodCompatibility[
    receiverBloodType
  ] || [];
}

// =====================================================
// CRITICALITY
// =====================================================

function getCriticalityLevel(
  currentStock,
  unitsNeeded
) {

  if (!unitsNeeded || unitsNeeded <= 0) {
    return 'Unknown';
  }

  const ratio =
    currentStock / unitsNeeded;

  if (ratio < 0.5) {
    return 'Critical';
  }

  if (ratio < 1) {
    return 'High';
  }

  if (ratio < 2) {
    return 'Moderate';
  }

  return 'Sufficient';
}

// =====================================================
// PARSE APPEAL
// =====================================================

function parseAppealContent(
  responseText
) {

  const smsMatch =
    responseText.match(
      /SMS:(.*?)(?=EMAIL SUBJECT:|$)/s
    );

  const subjectMatch =
    responseText.match(
      /EMAIL SUBJECT:(.*?)(?=EMAIL BODY:|$)/s
    );

  const bodyMatch =
    responseText.match(
      /EMAIL BODY:(.*?)$/s
    );

  return {

    sms:
      smsMatch
        ? smsMatch[1].trim()
        : '',

    email: {

      subject:
        subjectMatch
          ? subjectMatch[1].trim()
          : '',

      body:
        bodyMatch
          ? bodyMatch[1].trim()
          : ''
    }
  };
}

// =====================================================
// DAILY USAGE CALCULATION
// =====================================================

function calculateDailyUsage(
  requests
) {

  const bloodTypes = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];

  const usage = {};

  bloodTypes.forEach(type => {

    const typeRequests =
      requests.filter(
        req =>
          req.bloodType === type
      );

    const totalUnits =
      typeRequests.reduce(
        (sum, req) =>
          sum +
          (Number(req.unitsNeeded) || 0),
        0
      );

    usage[type] =
      totalUnits / 90;
  });

  return usage;
}

// =====================================================
// PREDICTION
// =====================================================

function predictNeeds(
  inventory,
  dailyUsage,
  days
) {

  const prediction = {

    currentInventory: {},

    predictedUsage: {},

    predictedShortage: {},

    recommendedDonations: {}
  };

  const bloodTypes = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];

  bloodTypes.forEach(type => {

    prediction.currentInventory[type] = 0;

    prediction.predictedUsage[type] =
      Math.ceil(
        (dailyUsage[type] || 0) *
        days
      );

    prediction.predictedShortage[type] = 0;

    prediction.recommendedDonations[type] = 0;
  });

  const inventoryArray =
    Array.isArray(inventory)
      ? inventory
      : [inventory];

  inventoryArray.forEach(item => {

    if (
      !item ||
      !item.bloodType
    ) {
      return;
    }

    const bloodType =
      item.bloodType;

    const units =
      Number(item.units) || 0;

    prediction.currentInventory[
      bloodType
    ] = units;

    const projectedRemaining =
      units -
      prediction.predictedUsage[
        bloodType
      ];

    if (
      projectedRemaining < 0
    ) {

      prediction.predictedShortage[
        bloodType
      ] =
        Math.abs(
          projectedRemaining
        );

      prediction.recommendedDonations[
        bloodType
      ] =
        Math.ceil(
          Math.abs(
            projectedRemaining
          ) * 1.2
        );
    }
  });

  return prediction;
}
