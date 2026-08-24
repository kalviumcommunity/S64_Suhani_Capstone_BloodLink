const foursquare = require('../utils/foursquare');

/**
 * GET /api/centers/nearby?lat=...&lng=...
 * Fetch hospitals near the user's current location.
 */
const getNearbyCenters = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Validate coordinates
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude',
      });
    }

    console.log(
      `Fetching hospitals near lat: ${latitude}, lng: ${longitude}`
    );

    const response = await foursquare.get('/search', {
      params: {
        ll: `${latitude},${longitude}`,
        query: 'hospital',
        radius: 10000,
        limit: 50,
        sort: 'distance',

        // Explicitly request useful fields
        fields:
          'fsq_place_id,name,location,latitude,longitude,distance,categories,tel,website',
      },
    });

    const centers = response.data?.results || [];

    console.log(`Found ${centers.length} hospitals`);

    return res.status(200).json({
      success: true,
      count: centers.length,
      results: centers,
    });
  } catch (error) {
    console.error(
      'Foursquare API error:',
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch nearby hospitals',
      error:
        error.response?.data?.message ||
        error.response?.data?.meta?.errorDetail ||
        error.message,
    });
  }
};


/**
 * GET /api/centers/search?query=Jaipur
 * Search hospitals in a particular city/place.
 */
const searchCentersByPlace = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    const searchQuery = query.trim();

    console.log(`Searching hospitals in: ${searchQuery}`);

    const response = await foursquare.get('/search', {
      params: {
        near: searchQuery,
        query: 'hospital',
        limit: 50,
        sort: 'relevance',

        fields:
          'fsq_place_id,name,location,latitude,longitude,distance,categories,tel,website',
      },
    });

    const centers = response.data?.results || [];

    console.log(
      `Found ${centers.length} hospitals for ${searchQuery}`
    );

    return res.status(200).json({
      success: true,
      count: centers.length,
      results: centers,
    });
  } catch (error) {
    console.error(
      'Foursquare Search Error:',
      error.response?.data || error.message
    );

    return res.status(502).json({
      success: false,
      message: 'Could not find hospitals for the specified location',
      error:
        error.response?.data?.message ||
        error.response?.data?.meta?.errorDetail ||
        error.message,
    });
  }
};


module.exports = {
  getNearbyCenters,
  searchCentersByPlace,
};