const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { LLMChain } = require('langchain/chains');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');
const Donor = require('../models/Donor');
const BloodInventory = require('../models/BloodInventory');
const DonationRequest = require('../models/DonationRequest');

// Initialize Gemini with environment variables
let genAI;
let llm;

function initializeGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    llm = new GeminiLLM();
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
}

// Create a custom LLM class to wrap Gemini
class GeminiLLM {
  constructor() {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async call(prompt) {
    try {
      // Ensure prompt is a string
      const promptText = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

      // Generate content using the format from Google AI Studio
      const result = await this.model.generateContent({
        contents: [{
          parts: [{ text: promptText }]
        }]
      });

      if (!result || !result.response) {
        throw new Error('No response received from Gemini API');
      }

      const text = result.response.text();
      
      if (!text) {
        throw new Error('Empty response text from Gemini API');
      }

      return { text };
    } catch (error) {
      console.error('Error calling Gemini:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  // Implement the required LangChain interface methods
  async invoke(input) {
    return this.call(input);
  }

  async pipe(output) {
    return output;
  }

  async stream(input) {
    const response = await this.call(input);
    return [response];
  }
}

// Initialize Gemini when the module is loaded
const isInitialized = initializeGemini();

// 1. Smart Donor Matching System
exports.smartDonorMatch = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get the donation request details
    const request = await DonationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Donation request not found' });
    }
    
    // Get eligible donors with compatible blood types
    const compatibleTypes = getCompatibleBloodTypes(request.bloodType);
    const eligibleDonors = await Donor.find({
      bloodType: { $in: compatibleTypes },
      eligibleToDonateSince: { $lte: new Date() }
    }).limit(50);
    
    if (eligibleDonors.length === 0) {
      return res.json({ 
        message: 'No eligible donors found',
        recommendations: [] 
      });
    }
    
    // Create a structured output parser for donor recommendations
    const donorRecommendationParser = StructuredOutputParser.fromZodSchema(
      z.array(
        z.object({
          donorId: z.string(),
          priorityScore: z.number(),
          reasonForSelection: z.string(),
          contactStrategy: z.string()
        })
      )
    );
    
    // Create prompt template for recommending donors
    const donorMatchPrompt = new PromptTemplate({
      template: `You are an AI assistant for a blood donation center.
      
      PATIENT NEED:
      - Blood type needed: {bloodType}
      - Units needed: {unitsNeeded}
      - Urgency level: {urgency}
      
      ELIGIBLE DONORS:
      {donorDetails}
      
      Based on the above information, recommend the top 5 donors to contact in priority order.
      Consider blood type compatibility, donation history, time since last donation, and the urgency level.
      
      For donors with exact blood type matches, prioritize them higher.
      For urgent/critical requests, prioritize donors who have donated frequently and reliably in the past.
      
      {format_instructions}
      `,
      inputVariables: ['bloodType', 'unitsNeeded', 'urgency', 'donorDetails'],
      partialVariables: {
        format_instructions: donorRecommendationParser.getFormatInstructions()
      }
    });
    
    // Format donor details for the prompt
    const donorDetails = eligibleDonors.map(donor => {
      const donationCount = donor.donationHistory?.length || 0;
      const daysSinceLastDonation = donor.lastDonation 
        ? Math.floor((new Date() - donor.lastDonation) / (1000 * 60 * 60 * 24))
        : null;
        
      return `
      Donor ID: ${donor._id}
      Name: ${donor.name}
      Blood Type: ${donor.bloodType}
      Previous Donations: ${donationCount}
      Days Since Last Donation: ${daysSinceLastDonation || 'Never donated'}
      `;
    }).join('\n');
    
    // Create chain
    const donorMatchChain = new LLMChain({
      llm: llm,
      prompt: donorMatchPrompt,
    });
    
    // Run the chain
    const response = await donorMatchChain.call({
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      urgency: request.urgency,
      donorDetails: donorDetails
    });
    
    // Parse the output
    const recommendations = await donorRecommendationParser.parse(response.text);
    
    // Hydrate the recommendations with donor details
    const hydratedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const donor = await Donor.findById(rec.donorId)
          .select('name bloodType phone email lastDonation');
        
        return {
          ...rec,
          donor: donor ? donor.toObject() : { error: 'Donor not found' }
        };
      })
    );
    
    return res.json({
      requestDetails: request,
      recommendations: hydratedRecommendations
    });
    
  } catch (error) {
    console.error('Error in smart donor matching:', error);
    return res.status(500).json({ error: 'Server error during smart donor matching' });
  }
};

// 2. Donation Appeals Generator
exports.generateDonationAppeal = async (req, res) => {
  try {
    const { donorId, requestId } = req.params;
    
    // Get donor and request details
    const donor = await Donor.findById(donorId);
    const request = await DonationRequest.findById(requestId);
    
    if (!donor || !request) {
      return res.status(404).json({ 
        error: !donor ? 'Donor not found' : 'Donation request not found' 
      });
    }
    
    // Get urgency context from current inventory
    const inventory = await BloodInventory.findOne({ bloodType: request.bloodType });
    const currentStock = inventory ? inventory.units : 0;
    const criticality = getCriticalityLevel(currentStock, request.unitsNeeded);
    
    // Create prompt template for donation appeal
    const appealPrompt = new PromptTemplate({
      template: `Generate a personalized donation appeal message for a blood donor.

      DONOR INFORMATION:
      Name: {donorName}
      Blood Type: {donorBloodType}
      Previous Donations: {donationCount}
      Last Donation Date: {lastDonationDate}
      
      REQUEST DETAILS:
      Patient Blood Type Needed: {requestBloodType}
      Units Needed: {unitsNeeded}
      Urgency: {urgency}
      Current Blood Bank Stock: {currentStock} units
      Stock Criticality: {criticality}
      
      Write a personalized SMS and email appeal to this donor that:
      1. Addresses them by name
      2. Mentions their specific blood type compatibility
      3. Conveys the appropriate level of urgency without causing alarm
      4. Includes a clear call to action
      5. Expresses gratitude for past donations if they've donated before
      6. Keeps the message concise, warm, and motivating
      
      FORMAT YOUR RESPONSE AS:
      
      SMS: [SMS text limited to 160 characters]
      
      EMAIL SUBJECT: [Email subject line]
      
      EMAIL BODY:
      [Email content]
      `,
      inputVariables: [
        'donorName', 'donorBloodType', 'donationCount', 'lastDonationDate',
        'requestBloodType', 'unitsNeeded', 'urgency', 'currentStock', 'criticality'
      ],
    });
    
    // Create and run the chain
    const appealChain = new LLMChain({
      llm: llm,
      prompt: appealPrompt,
    });
    
    const response = await appealChain.call({
      donorName: donor.name,
      donorBloodType: donor.bloodType,
      donationCount: donor.donationHistory?.length || 0,
      lastDonationDate: donor.lastDonation ? donor.lastDonation.toDateString() : 'Never',
      requestBloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      urgency: request.urgency,
      currentStock: currentStock,
      criticality: criticality
    });
    
    // Parse out SMS and email content
    const result = parseAppealContent(response.text);
    
    return res.json({
      donorId: donor._id,
      donorName: donor.name,
      requestId: request._id,
      appeal: result
    });
    
  } catch (error) {
    console.error('Error generating donation appeal:', error);
    return res.status(500).json({ error: 'Server error during appeal generation' });
  }
};

// 3. Inventory Forecasting with Explanation
exports.explainableInventoryForecast = async (req, res) => {
  try {
    if (!isInitialized) {
      return res.status(500).json({ 
        error: 'Gemini AI not initialized',
        details: 'Please check your GEMINI_API_KEY environment variable'
      });
    }

    const { days = 30 } = req.query;
    
    // Get current inventory data
    let inventoryData = await BloodInventory.find();
    
    // If no inventory data, use mock data for testing
    if (!inventoryData || inventoryData.length === 0) {
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
    
    // Get historical requests
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    let requests = await DonationRequest.find({
      requestDate: { $gte: threeMonthsAgo }
    });

    // If no request data, use mock data for testing
    if (!requests || requests.length === 0) {
      requests = [
        { bloodType: 'A+', unitsNeeded: 20, urgency: 'high', requestDate: new Date() },
        { bloodType: 'O-', unitsNeeded: 15, urgency: 'critical', requestDate: new Date() },
        { bloodType: 'B+', unitsNeeded: 10, urgency: 'medium', requestDate: new Date() },
        { bloodType: 'AB+', unitsNeeded: 5, urgency: 'low', requestDate: new Date() }
      ];
    }
    
    // Calculate daily usage first to ensure we have valid data
    const bloodTypeUsage = calculateDailyUsage(requests);
    if (!bloodTypeUsage || Object.keys(bloodTypeUsage).length === 0) {
      throw new Error('Failed to calculate daily usage from request data');
    }
    
    // Format inventory and historical data for the prompt
    const currentInventoryText = inventoryData.map(item => 
      `${item.bloodType}: ${item.units} units`
    ).join('\n');
    
    const historicalDataText = Object.entries(bloodTypeUsage).map(([bloodType, usage]) => 
      `${bloodType}: Average daily usage of ${usage.toFixed(2)} units`
    ).join('\n');
    
    // Create a simple prompt without LangChain
    const prompt = `You are an AI assistant for a blood bank. Analyze the current blood inventory and historical usage data to provide a ${days}-day forecast with clear explanations.

    CURRENT INVENTORY:
    ${currentInventoryText}
    
    HISTORICAL USAGE DATA (LAST 90 DAYS):
    ${historicalDataText}
    
    Please provide:
    1. A forecast of expected blood usage for each blood type over the next ${days} days
    2. Clear explanations of your reasoning for each blood type
    3. Identification of potential shortages
    4. Specific, actionable recommendations for the blood bank
    
    Format your analysis to be easily understood by blood bank staff.`;
    
    let response;
    try {
      // Call Gemini directly
      response = await llm.call(prompt);
      
      if (!response || !response.text) {
        throw new Error('Empty response from Gemini');
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      throw new Error(`Failed to generate forecast analysis: ${error.message}`);
    }

    // Calculate quantitative predictions
    const quantitativePrediction = predictNeeds(inventoryData, bloodTypeUsage, days);
    
    if (!quantitativePrediction) {
      throw new Error('Failed to generate quantitative predictions');
    }
    
    return res.json({
      quantitativeForecast: quantitativePrediction,
      explainableForecast: response.text,
      daysForecasted: days,
      analysisDate: new Date()
    });
    
  } catch (error) {
    console.error('Error generating explainable forecast:', error);
    return res.status(500).json({ 
      error: 'Server error during forecast generation',
      details: error.message 
    });
  }
};

// 4. Donor Engagement Strategy Advisor
exports.donorEngagementStrategy = async (req, res) => {
  try {
    const { donorId } = req.params;
    
    // Get donor information
    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    
    // Get donor's donation history
    const donationCount = donor.donationHistory?.length || 0;
    const lastDonation = donor.lastDonation;
    const daysSinceLastDonation = lastDonation 
      ? Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24))
      : null;
    
    // Create a parser for structured strategy recommendations
    const engagementParser = StructuredOutputParser.fromZodSchema(
      z.object({
        donorProfile: z.string().describe("Brief analysis of the donor's donation history and patterns"),
        recommendedApproach: z.string().describe("Overall engagement strategy"),
        communicationChannels: z.array(z.object({
          channel: z.string(),
          rationale: z.string(),
          timing: z.string()
        })),
        keyMessages: z.array(z.string().describe("Key messages that will resonate with this donor")),
        potentialBarriers: z.array(z.string().describe("Barriers that might prevent donation")),
        longTermEngagement: z.string().describe("Strategy for long-term engagement")
      })
    );
    
    // Create prompt template
    const engagementPrompt = new PromptTemplate({
      template: `You are an AI consultant for a blood donation center. Create a personalized donor engagement strategy.

      DONOR INFORMATION:
      Name: {donorName}
      Blood Type: {bloodType}
      Total Donations: {donationCount}
      Last Donation: {lastDonationDays} days ago
      Medical Conditions: {medicalConditions}
      
      Based on this donor's profile, develop a personalized engagement strategy to encourage regular donations.
      Consider their donation history, the rarity of their blood type, and any patterns in their donation behavior.
      
      {format_instructions}
      `,
      inputVariables: ['donorName', 'bloodType', 'donationCount', 'lastDonationDays', 'medicalConditions'],
      partialVariables: {
        format_instructions: engagementParser.getFormatInstructions()
      }
    });
    
    // Create and run the chain
    const engagementChain = new LLMChain({
      llm: llm,
      prompt: engagementPrompt,
    });
    
    const response = await engagementChain.call({
      donorName: donor.name,
      bloodType: donor.bloodType,
      donationCount: donationCount,
      lastDonationDays: daysSinceLastDonation || 'Never donated',
      medicalConditions: donor.medicalConditions?.join(', ') || 'None'
    });
    
    // Parse the result
    const engagementStrategy = await engagementParser.parse(response.text);
    
    return res.json({
      donorId: donor._id,
      donorName: donor.name,
      bloodType: donor.bloodType,
      engagementStrategy
    });
    
  } catch (error) {
    console.error('Error generating engagement strategy:', error);
    return res.status(500).json({ error: 'Server error during strategy generation' });
  }
};

// Helper functions

// Blood type compatibility
function getCompatibleBloodTypes(receiverBloodType) {
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
  
  return bloodCompatibility[receiverBloodType] || [];
}

// Get criticality level based on current stock and needs
function getCriticalityLevel(currentStock, unitsNeeded) {
  const ratio = currentStock / unitsNeeded;
  
  if (ratio < 0.5) return 'Critical';
  if (ratio < 1) return 'High';
  if (ratio < 2) return 'Moderate';
  return 'Sufficient';
}

// Parse appeal content from LLM response
function parseAppealContent(responseText) {
  // Simple parser to extract SMS and email content
  const smsMatch = responseText.match(/SMS:(.*?)(?=EMAIL SUBJECT:|$)/s);
  const subjectMatch = responseText.match(/EMAIL SUBJECT:(.*?)(?=EMAIL BODY:|$)/s);
  const bodyMatch = responseText.match(/EMAIL BODY:(.*?)$/s);
  
  return {
    sms: smsMatch ? smsMatch[1].trim() : '',
    email: {
      subject: subjectMatch ? subjectMatch[1].trim() : '',
      body: bodyMatch ? bodyMatch[1].trim() : ''
    }
  };
}

// Import from aiController
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

function predictNeeds(inventory, dailyUsage, days) {
  try {
    const prediction = {
      currentInventory: {},
      predictedUsage: {},
      predictedShortage: {},
      recommendedDonations: {}
    };
    
    // Ensure inventory is an array
    const inventoryArray = Array.isArray(inventory) ? inventory : [inventory];
    
    // Initialize all blood types with 0 values
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bloodTypes.forEach(type => {
      prediction.currentInventory[type] = 0;
      prediction.predictedUsage[type] = 0;
      prediction.predictedShortage[type] = 0;
      prediction.recommendedDonations[type] = 0;
    });
    
    // Process inventory data
    inventoryArray.forEach(item => {
      if (!item || !item.bloodType) {
        console.warn('Invalid inventory item:', item);
        return;
      }
      
      const bloodType = item.bloodType;
      const units = Number(item.units) || 0;
      
      prediction.currentInventory[bloodType] = units;
      prediction.predictedUsage[bloodType] = Math.ceil((dailyUsage[bloodType] || 0) * days);
      
      const projectedRemaining = units - prediction.predictedUsage[bloodType];
      if (projectedRemaining < 0) {
        prediction.predictedShortage[bloodType] = Math.abs(projectedRemaining);
        prediction.recommendedDonations[bloodType] = Math.ceil(Math.abs(projectedRemaining) * 1.2); // 20% buffer
      }
    });
    
    return prediction;
  } catch (error) {
    console.error('Error in predictNeeds:', error);
    throw new Error('Failed to generate quantitative predictions');
  }
}