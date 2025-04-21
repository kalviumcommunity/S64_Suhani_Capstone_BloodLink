const foursquare = require('../utils/foursquare');

const getNearbyCenters = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Try a different API endpoint structure
    const response = await foursquare.get('/search', {
      params: {
        ll: `${lat},${lng}`,
        categories: '15000', // Category ID for Hospitals in Foursquare
        radius: 10000,
        limit: 50,
        sort: 'DISTANCE'
      }
    });
    
    const centers = response.data.results || [];
    res.json(centers);
  } catch (error) {
    console.error('Foursquare API error:', error.response?.data || error.message);
    
    // Try a fallback method if the first one fails
    try {
      const { lat, lng } = req.query;
      const fallbackResponse = await foursquare.get('/search', {
        params: {
          ll: `${lat},${lng}`,
          query: 'hospital',
          radius: 10000,
          limit: 50
        }
      });
      
      const centers = fallbackResponse.data.results || [];
      res.json(centers);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      res.status(500).json({ 
        message: 'Failed to fetch hospitals', 
        error: error.response?.data || error.message 
      });
    }
  }
};

const searchCentersByPlace = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    
    // Try a different API endpoint structure
    const response = await foursquare.get('/search', {
      params: {
        near: query,
        categories: '15000', // Category ID for Hospitals in Foursquare
        radius: 10000,
        limit: 50,
        sort: 'RELEVANCE'
      }
    });
    
    const centers = response.data.results || [];
    res.json(centers);
  } catch (error) {
    console.error('Foursquare Search Error:', error.response?.data || error.message);
    
    // Try a fallback method if the first one fails
    try {
      const { query } = req.query;
      const fallbackResponse = await foursquare.get('/search', {
        params: {
          query: 'hospital',
          near: query,
          limit: 50
        }
      });
      
      const centers = fallbackResponse.data.results || [];
      res.json(centers);
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError.message);
      res.status(500).json({ 
        message: 'Could not find hospitals for the specified location', 
        error: error.response?.data || error.message 
      });
    }
  }
};

module.exports = { getNearbyCenters, searchCentersByPlace };