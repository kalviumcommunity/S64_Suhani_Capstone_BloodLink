// backend/controller/langchainController.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { LLMChain } = require('langchain/chains');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');

const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const DonationRequest = require('../models/DonationRequest');


// =====================================================
// GEMINI INITIALIZATION
// =====================================================

let genAI;
let llm;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable is not set');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    llm = new GeminiLLM();

    console.log('✅ Gemini initialized successfully');

    return true;

  } catch (error) {
    console.error(
      '❌ Failed to initialize Gemini:',
      error.message
    );

    return false;
  }
}


// =====================================================
// CUSTOM GEMINI LLM
// Includes Retry + Exponential Backoff + Fallback
// =====================================================

class GeminiLLM {

  constructor() {

    if (!genAI) {
      throw new Error(
        'Gemini AI not initialized'
      );
    }

    // Primary + fallback models
    this.modelNames = [
      'gemini-3.7-flash',
      'gemini-2.5-flash'
    ];

    // Number of retries per model
    this.maxRetries = 3;

    // Initial retry delay
    this.baseDelay = 2000;
  }


  // ---------------------------------------------------
  // MAIN GEMINI CALL
  // ---------------------------------------------------

  async call(prompt) {

    const promptText =
      typeof prompt === 'string'
        ? prompt
        : JSON.stringify(prompt);

    let lastError = null;


    // Try each Gemini model
    for (const modelName of this.modelNames) {

      console.log(
        `🤖 Using Gemini model: ${modelName}`
      );

      const model =
        genAI.getGenerativeModel({
          model: modelName
        });


      // Retry the current model
      for (
        let attempt = 0;
        attempt <= this.maxRetries;
        attempt++
      ) {

        try {

          console.log(
            `🚀 Gemini request | Model: ${modelName} | Attempt: ${attempt + 1}/${this.maxRetries + 1}`
          );


          // Call Gemini API
          const result =
            await model.generateContent(
              promptText
            );


          const response =
            await result.response;


          const text =
            response.text();


          if (!text) {
            throw new Error(
              'Gemini returned an empty response'
            );
          }


          console.log(
            `✅ Gemini response successful using ${modelName}`
          );


          return {
            text
          };


        } catch (error) {

          lastError = error;


          console.error(
            `❌ Gemini error | Model: ${modelName} | Attempt: ${attempt + 1}`,
            error.message
          );


          const status = error.status;


          // Retry only temporary errors
          const retryableStatuses = [
            429,
            500,
            502,
            503,
            504
          ];


          const shouldRetry =
            retryableStatuses.includes(status);


          // Stop retrying if error is permanent
          if (
            !shouldRetry ||
            attempt === this.maxRetries
          ) {

            console.log(
              `⚠️ Stopping retries for ${modelName}`
            );

            break;
          }


          // Exponential backoff
          const delay =
            this.baseDelay *
            Math.pow(2, attempt) +
            Math.floor(Math.random() * 1000);


          console.log(
            `⏳ Gemini busy. Retrying in ${delay}ms...`
          );


          await new Promise(resolve =>
            setTimeout(resolve, delay)
          );

        }

      }


      console.log(
        `🔄 Switching to fallback model...`
      );

    }


    console.error(
      '❌ All Gemini models failed'
    );


    throw new Error(
      `All Gemini models failed: ${
        lastError?.message || 'Unknown error'
      }`
    );

  }


  // ---------------------------------------------------
  // LANGCHAIN COMPATIBILITY
  // ---------------------------------------------------

  async invoke(input) {
    return this.call(input);
  }


  async stream(input) {
    const response =
      await this.call(input);

    return [response];
  }


  async pipe(output) {
    return output;
  }

}


// =====================================================
// INITIALIZE GEMINI
// =====================================================

const isInitialized =
  initializeGemini();


// =====================================================
// 1. SMART DONOR MATCHING
// =====================================================

exports.smartDonorMatch = async (req, res) => {

  try {

    if (!isInitialized) {
      return res.status(503).json({
        success: false,
        error: 'Gemini AI is not initialized'
      });
    }


    const { requestId } =
      req.params;


    const request =
      await DonationRequest.findById(
        requestId
      );


    if (!request) {

      return res.status(404).json({
        error: 'Donation request not found'
      });

    }


    const compatibleTypes =
      getCompatibleBloodTypes(
        request.bloodType
      );


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

        message:
          'No eligible donors found',

        recommendations: []

      });

    }


    const donorRecommendationParser =
      StructuredOutputParser.fromZodSchema(

        z.array(

          z.object({

            donorId:
              z.string(),

            priorityScore:
              z.number(),

            reasonForSelection:
              z.string(),

            contactStrategy:
              z.string()

          })

        )

      );


    const donorMatchPrompt =
      new PromptTemplate({

        template: `
You are an AI assistant for a blood donation center.

PATIENT NEED:

Blood type needed: {bloodType}

Units needed: {unitsNeeded}

Urgency level: {urgency}


ELIGIBLE DONORS:

{donorDetails}


Recommend the top 5 donors.

Prioritize:

1. Exact blood type compatibility
2. Eligibility
3. Donation history
4. Time since last donation
5. Urgency level


{format_instructions}
`,

        inputVariables: [

          'bloodType',

          'unitsNeeded',

          'urgency',

          'donorDetails'

        ],

        partialVariables: {

          format_instructions:
            donorRecommendationParser
              .getFormatInstructions()

        }

      });


    const donorDetails =
      eligibleDonors.map(donor => {

        const donationCount =
          donor.donationHistory?.length || 0;


        const daysSinceLastDonation =
          donor.lastDonation
            ? Math.floor(
                (new Date() -
                  donor.lastDonation) /
                (1000 * 60 * 60 * 24)
              )
            : null;


        return `
Donor ID: ${donor._id}

Name: ${donor.name}

Blood Type: ${donor.bloodType}

Previous Donations: ${donationCount}

Days Since Last Donation:
${daysSinceLastDonation || 'Never donated'}
`;

      }).join('\n');


    // Use direct Gemini instead of depending
    // completely on LLMChain internals

    const prompt =
      await donorMatchPrompt.format({

        bloodType:
          request.bloodType,

        unitsNeeded:
          request.unitsNeeded,

        urgency:
          request.urgency,

        donorDetails

      });


    const response =
      await llm.call(prompt);


    const recommendations =
      await donorRecommendationParser.parse(
        response.text
      );


    const hydratedRecommendations =
      await Promise.all(

        recommendations.map(
          async rec => {

            const donor =
              await Donor.findById(
                rec.donorId
              ).select(
                'name bloodType phone email lastDonation'
              );


            return {

              ...rec,

              donor:
                donor
                  ? donor.toObject()
                  : {
                      error:
                        'Donor not found'
                    }

            };

          }
        )

      );


    return res.json({

      success: true,

      requestDetails:
        request,

      recommendations:
        hydratedRecommendations

    });


  } catch (error) {

    console.error(
      '❌ Error in smart donor matching:',
      error
    );


    return handleAIError(
      res,
      error,
      'smart donor matching'
    );

  }

};


// =====================================================
// 2. DONATION APPEAL GENERATOR
// =====================================================

exports.generateDonationAppeal =
async (req, res) => {

  try {

    if (!isInitialized) {

      return res.status(503).json({

        success: false,

        error:
          'Gemini AI is not initialized'

      });

    }


    const {
      donorId,
      requestId
    } = req.params;


    const donor =
      await Donor.findById(
        donorId
      );


    const request =
      await DonationRequest.findById(
        requestId
      );


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

        bloodType:
          request.bloodType

      });


    const currentStock =
      inventory
        ? inventory.units
        : 0;


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

Previous Donations:
${donor.donationHistory?.length || 0}

Last Donation:
${
  donor.lastDonation
    ? donor.lastDonation.toDateString()
    : 'Never'
}


REQUEST:

Blood Type:
${request.bloodType}

Units Needed:
${request.unitsNeeded}

Urgency:
${request.urgency}

Current Stock:
${currentStock}

Criticality:
${criticality}


Return exactly:

SMS:
[maximum 160 characters]

EMAIL SUBJECT:
[text]

EMAIL BODY:
[text]
`;


    const response =
      await llm.call(
        prompt
      );


    const result =
      parseAppealContent(
        response.text
      );


    return res.json({

      success: true,

      donorId:
        donor._id,

      donorName:
        donor.name,

      requestId:
        request._id,

      appeal:
        result

    });


  } catch (error) {

    console.error(
      '❌ Error generating donation appeal:',
      error
    );


    return handleAIError(
      res,
      error,
      'appeal generation'
    );

  }

};


// =====================================================
// 3. INVENTORY FORECAST
// =====================================================

exports.explainableInventoryForecast =
async (req, res) => {

  try {

    if (!isInitialized) {

      return res.status(503).json({

        success: false,

        error:
          'Gemini AI is not initialized',

        details:
          'Check GEMINI_API_KEY'

      });

    }


    const days =
      Number(req.query.days) || 30;


    // -----------------------------------------------
    // GET INVENTORY
    // -----------------------------------------------

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

        {
          bloodType: 'A+',
          units: 100
        },

        {
          bloodType: 'A-',
          units: 50
        },

        {
          bloodType: 'B+',
          units: 75
        },

        {
          bloodType: 'B-',
          units: 40
        },

        {
          bloodType: 'AB+',
          units: 30
        },

        {
          bloodType: 'AB-',
          units: 20
        },

        {
          bloodType: 'O+',
          units: 120
        },

        {
          bloodType: 'O-',
          units: 60
        }

      ];

    }


    // -----------------------------------------------
    // GET REQUEST HISTORY
    // -----------------------------------------------

    const threeMonthsAgo =
      new Date();


    threeMonthsAgo.setMonth(
      threeMonthsAgo.getMonth() - 3
    );


    let requests =
      await DonationRequest.find({

        requestDate: {

          $gte:
            threeMonthsAgo

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

          requestDate:
            new Date()

        },

        {

          bloodType: 'O-',

          unitsNeeded: 15,

          urgency: 'critical',

          requestDate:
            new Date()

        },

        {

          bloodType: 'B+',

          unitsNeeded: 10,

          urgency: 'medium',

          requestDate:
            new Date()

        },

        {

          bloodType: 'AB+',

          unitsNeeded: 5,

          urgency: 'low',

          requestDate:
            new Date()

        }

      ];

    }


    // -----------------------------------------------
    // CALCULATE USAGE
    // -----------------------------------------------

    const bloodTypeUsage =
      calculateDailyUsage(
        requests
      );


    // -----------------------------------------------
    // QUANTITATIVE FORECAST
    // -----------------------------------------------

    const quantitativePrediction =
      predictNeeds(

        inventoryData,

        bloodTypeUsage,

        days

      );


    // -----------------------------------------------
    // FORMAT DATA
    // -----------------------------------------------

    const currentInventoryText =
      inventoryData.map(item =>
        `${item.bloodType}: ${item.units} units`
      ).join('\n');


    const historicalDataText =
      Object.entries(
        bloodTypeUsage
      ).map(

        ([bloodType, usage]) =>

          `${bloodType}: ${usage.toFixed(2)} units/day`

      ).join('\n');


    // -----------------------------------------------
    // GEMINI PROMPT
    // -----------------------------------------------

    const prompt = `
You are an AI assistant for a blood bank.

Analyze the following blood inventory data.

FORECAST PERIOD:
${days} days


CURRENT INVENTORY:

${currentInventoryText}


AVERAGE DAILY USAGE:

${historicalDataText}


QUANTITATIVE FORECAST:

${JSON.stringify(
  quantitativePrediction,
  null,
  2
)}


Provide:

1. A clear summary
2. Blood types at risk of shortage
3. Reasons for the prediction
4. Recommended donation priorities
5. Specific actionable recommendations

Keep the response concise and easy for
blood bank staff to understand.
`;


    // -----------------------------------------------
    // CALL GEMINI
    // -----------------------------------------------

    console.log(
      '🤖 Generating explainable forecast...'
    );


    const response =
      await llm.call(
        prompt
      );


    // -----------------------------------------------
    // SUCCESS
    // -----------------------------------------------

    return res.json({

      success: true,

      quantitativeForecast:
        quantitativePrediction,

      explainableForecast:
        response.text,

      daysForecasted:
        days,

      analysisDate:
        new Date()

    });


  } catch (error) {

    console.error(
      '❌ Error generating explainable forecast:',
      error
    );


    return handleAIError(
      res,
      error,
      'forecast generation'
    );

  }

};


// =====================================================
// 4. DONOR ENGAGEMENT STRATEGY
// =====================================================

exports.donorEngagementStrategy =
async (req, res) => {

  try {

    if (!isInitialized) {

      return res.status(503).json({

        success: false,

        error:
          'Gemini AI is not initialized'

      });

    }


    const { donorId } =
      req.params;


    const donor =
      await Donor.findById(
        donorId
      );


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
            (
              new Date() -
              donor.lastDonation
            ) /
            (1000 * 60 * 60 * 24)
          )

        : 'Never donated';


    const prompt = `
You are an AI consultant for a blood donation center.

Create a personalized donor engagement strategy.

DONOR:

Name:
${donor.name}

Blood Type:
${donor.bloodType}

Total Donations:
${donationCount}

Days Since Last Donation:
${daysSinceLastDonation}

Medical Conditions:
${donor.medicalConditions?.join(', ') || 'None'}


Provide:

1. Donor Profile Analysis
2. Recommended Approach
3. Best Communication Channels
4. Recommended Timing
5. Key Messages
6. Potential Barriers
7. Long-Term Engagement Strategy

Format clearly using headings and bullet points.
`;


    const response =
      await llm.call(
        prompt
      );


    return res.json({

      success: true,

      donorId:
        donor._id,

      donorName:
        donor.name,

      bloodType:
        donor.bloodType,

      engagementStrategy:
        response.text

    });


  } catch (error) {

    console.error(
      '❌ Error generating engagement strategy:',
      error
    );


    return handleAIError(
      res,
      error,
      'engagement strategy generation'
    );

  }

};


// =====================================================
// AI ERROR HANDLER
// =====================================================

function handleAIError(
  res,
  error,
  operation
) {

  const message =
    error.message || '';

  const isServiceUnavailable =
    message.includes('503') ||
    message.includes('Service Unavailable');

  const isRateLimited =
    message.includes('429') ||
    message.includes('Too Many Requests');


  if (isServiceUnavailable) {

    return res.status(503).json({

      success: false,

      error:
        'AI service is temporarily busy. Please try again in a moment.',

      details:
        message

    });

  }


  if (isRateLimited) {

    return res.status(429).json({

      success: false,

      error:
        'AI request limit reached. Please try again later.',

      details:
        message

    });

  }


  return res.status(500).json({

    success: false,

    error:
      `Server error during ${operation}`,

    details:
      message

  });

}


// =====================================================
// BLOOD TYPE COMPATIBILITY
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


  return (
    bloodCompatibility[
      receiverBloodType
    ] || []
  );

}


// =====================================================
// CRITICALITY LEVEL
// =====================================================

function getCriticalityLevel(
  currentStock,
  unitsNeeded
) {

  if (!unitsNeeded || unitsNeeded <= 0) {
    return 'Sufficient';
  }


  const ratio =
    currentStock /
    unitsNeeded;


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
// PARSE APPEAL CONTENT
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
// CALCULATE DAILY BLOOD USAGE
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
          (
            Number(
              req.unitsNeeded
            ) || 0
          ),

        0

      );


    usage[type] =
      totalUnits / 90;

  });


  return usage;

}


// =====================================================
// PREDICT BLOOD NEEDS
// =====================================================

function predictNeeds(
  inventory,
  dailyUsage,
  days
) {

  try {

    const prediction = {

      currentInventory: {},

      predictedUsage: {},

      predictedShortage: {},

      recommendedDonations: {}

    };


    const inventoryArray =
      Array.isArray(inventory)
        ? inventory
        : [inventory];


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


    // Initialize all types

    bloodTypes.forEach(type => {

      prediction.currentInventory[type] = 0;

      prediction.predictedUsage[type] = 0;

      prediction.predictedShortage[type] = 0;

      prediction.recommendedDonations[type] = 0;

    });


    // Process inventory

    inventoryArray.forEach(item => {

      if (
        !item ||
        !item.bloodType
      ) {

        console.warn(
          'Invalid inventory item:',
          item
        );

        return;

      }


      const bloodType =
        item.bloodType;


      const units =
        Number(item.units) || 0;


      const predictedUsage =
        Math.ceil(
          (dailyUsage[bloodType] || 0) *
          days
        );


      prediction.currentInventory[
        bloodType
      ] = units;


      prediction.predictedUsage[
        bloodType
      ] = predictedUsage;


      const projectedRemaining =
        units -
        predictedUsage;


      if (
        projectedRemaining < 0
      ) {

        const shortage =
          Math.abs(
            projectedRemaining
          );


        prediction.predictedShortage[
          bloodType
        ] = shortage;


        prediction.recommendedDonations[
          bloodType
        ] = Math.ceil(
          shortage * 1.2
        );

      }

    });


    return prediction;


  } catch (error) {

    console.error(
      'Error in predictNeeds:',
      error
    );


    throw new Error(
      'Failed to generate quantitative predictions'
    );

  }

}
