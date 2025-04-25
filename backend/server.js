const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/db');
const { setupWebSocket } = require('./socket');


dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());


// ✅ Route Test (Optional Debugging Route)
app.get('/api/test', (req, res) => {
  res.send('✅ API is working!');
});

// ✅ Load Routes
const authRoutes = require('./routes/authRoutes');
const slotRoutes = require('./routes/slotRoutes');
const centerRoutes = require('./routes/centerRoutes');
const notifyRoutes = require('./routes/notifyRoutes');

// ✅ Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/notify', notifyRoutes);

// API endpoint to create a profile
app.post('/api/create-profile', upload.single('photo'), (req, res) => {
  try {
    const userId = uuidv4(); // Generate unique user ID
    
    // Create profile object from form data
    const profile = {
      userId,
      ...req.body,
      photoUrl: req.file ? `/uploads/profile-photos/${req.file.filename}` : null,
      createdAt: new Date()
    };
    
    // Save profile to our "database"
    profiles.push(profile);
    
    console.log('Profile created:', profile);
    
    // Return success response with user ID
    res.status(201).json({
      success: true,
      message: 'Profile created successfully!',
      userId
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create profile. ' + error.message
    });
  }
});

// API endpoint to get a profile by ID
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Find profile in our "database"
  const profile = profiles.find(p => p.userId === userId);
  
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }
  
  res.json({
    success: true,
    profile
  });
});

// API endpoint to get all profiles
app.get('/api/profiles', (req, res) => {
  res.json({
    success: true,
    profiles
  });
});

// NEW: API endpoint to update a profile
app.put('/api/profile/:userId', upload.single('photo'), (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find profile index in our "database"
    const profileIndex = profiles.findIndex(p => p.userId === userId);
    
    if (profileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    // Get the existing profile
    const existingProfile = profiles[profileIndex];
    
    // Create updated profile object
    const updatedProfile = {
      ...existingProfile,
      ...req.body,
      userId, // Ensure userId remains the same
      updatedAt: new Date()
    };
    

    console.log('✅ All routes registered');

    // Connect to MongoDB and start server
    connectDB().then(() => {
      // WebSocket setup
      setupWebSocket(server);
      setupCleanupJob();
      
      // Start server
      server.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
      });
    }).catch((err) => {
      console.error('❌ Failed to start server:', err.message);
    });