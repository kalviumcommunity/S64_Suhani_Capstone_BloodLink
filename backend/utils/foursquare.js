// backend/utils/foursquare.js
const axios = require('axios');
require('dotenv').config();

const foursquare = axios.create({
  baseURL: 'https://api.foursquare.com/v3/places',
  headers: {
    Accept: 'application/json',
    Authorization: process.env.FSQ_API_KEY,
  },
});

module.exports = foursquare;
