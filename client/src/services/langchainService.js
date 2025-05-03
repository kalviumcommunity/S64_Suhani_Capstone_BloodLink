// services/langchainService.js

const API_BASE_URL =  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

const fetchConfig = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Create a service for donor matching
export const donorMatchingService = {
  async getSmartMatches(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/langchain/donor-match/${requestId}`, fetchConfig);
      if (!response.ok) {
        throw new Error('Failed to fetch donor matches');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in donor matching:', error);
      throw error;
    }
  }
};

// Create a service for donation appeals
export const donationAppealService = {
  async generateAppeal(donorId, requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/langchain/appeal/${donorId}/${requestId}`, fetchConfig);
      if (!response.ok) {
        throw new Error('Failed to generate donation appeal');
      }
      return await response.json();
    } catch (error) {
      console.error('Error generating donation appeal:', error);
      throw error;
    }
  }
};

// Create a service for inventory forecasting
export const inventoryForecastService = {
  async getForecast(days = 30) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/langchain/forecast/explain?days=${days}`, {
        ...fetchConfig,
        method: 'GET'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch inventory forecast');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in inventory forecasting:', error);
      throw error;
    }
  }
};

// Create a service for donor engagement
export const donorEngagementService = {
  async getEngagementStrategy(donorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/langchain/engagement/${donorId}`, fetchConfig);
      if (!response.ok) {
        throw new Error('Failed to fetch engagement strategy');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in donor engagement:', error);
      throw error;
    }
  }
}; 