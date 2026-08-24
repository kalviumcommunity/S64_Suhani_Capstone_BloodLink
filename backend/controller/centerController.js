const foursquare = require('../utils/foursquare');

/**
 * GET /api/centers/nearby?lat=...&lng=...
 * Fetch nearby hospitals using the Foursquare Places API
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

    // Check if coordinates are valid numbers
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
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

    // Call Foursquare API
    const response = await foursquare.get('/places/search', {
      params: {
        ll: `${latitude},${longitude}`,
        query: 'hospital',
        radius: 10000,
        limit: 20,
      },
    });

    const centers = response.data?.results || [];

    console.log(
      `Foursquare response status: ${response.status}`
    );

    console.log(
      `Hospitals found: ${centers.length}`
    );

    // Return array directly so your existing frontend
    // continues to work without changes
    return res.status(200).json(centers);

  } catch (error) {
    console.error('Foursquare request failed');

    console.error({
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(502).json({
      success: false,
      message: 'Failed to fetch nearby hospitals',
      details: error.response?.data || error.message,
    });
  }
};


/**
 * GET /api/centers/search?query=Jaipur
 * Search hospitals by city or place name
 */
const searchCentersByPlace = async (req, res) => {
  try {
    const { query } = req.query;

    // Validate query
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query is required',
      });
    }

    const searchLocation = query.trim();

    console.log(
      `Searching hospitals near: ${searchLocation}`
    );

    // Call Foursquare API
    const response = await foursquare.get('/places/search', {
      params: {
        near: searchLocation,
        query: 'hospital',
        limit: 20,
      },
    });

    const centers = response.data?.results || [];

    console.log(
      `Hospitals found for ${searchLocation}: ${centers.length}`
    );

    // Return array directly for frontend compatibility
    return res.status(200).json(centers);

  } catch (error) {
    console.error('Foursquare search failed');

    console.error({
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(502).json({
      success: false,
      message: 'Could not find hospitals for the specified location',
      details: error.response?.data || error.message,
    });
  }
};


module.exports = {
  getNearbyCenters,
  searchCentersByPlace,
};