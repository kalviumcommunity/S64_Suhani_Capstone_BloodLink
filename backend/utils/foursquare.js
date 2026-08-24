const axios = require('axios');
require('dotenv').config();

const foursquare = axios.create({
  baseURL: 'https://places-api.foursquare.com/places',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${process.env.FSQ_API_KEY}`,
    'X-Places-Api-Version': '2025-06-17',
  },
});

module.exports = foursquare;