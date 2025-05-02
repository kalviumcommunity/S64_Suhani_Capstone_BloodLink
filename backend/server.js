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
const { setupCleanupJob } = require('./jobs/cleanupJob');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
dotenv.config();
console.log('Environment variables loaded:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);


// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use('/uploads', express.static('uploads'));
app.set('trust proxy', 1);
app.use(apiLimiter);
// Configure storage for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads/profile-photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename with original extension
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Configure multer for file upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit to 5MB
  fileFilter: function(req, file, cb) {
    // Accept only image files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Simple in-memory database for profiles
// In a production app, you would use a real database like MongoDB or PostgreSQL
const profiles = [];

// ✅ Route Test (Optional Debugging Route)
app.get('/api/test', (req, res) => {
  res.send('✅ API is working!');
});

// ✅ Load Routes
const authRoutes = require('./routes/authRoutes');
const slotRoutes = require('./routes/slotRoutes');
const centerRoutes = require('./routes/centerRoutes');
const notifyRoutes = require('./routes/notifyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const donationRoutes = require('./routes/donationRoutes');
const langchainRoutes = require('./routes/langchainRoutes'); 

// ✅ Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/langchain', langchainRoutes); 

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
    // Update photo if a new one was uploaded
    if (req.file) {
      // Delete old photo if it exists
      if (existingProfile.photoUrl) {
        const oldPhotoPath = path.join(__dirname, existingProfile.photoUrl);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Set new photo URL
      updatedProfile.photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    }
    
    // Update profile in our "database"
    profiles[profileIndex] = updatedProfile;
    
    console.log('Profile updated:', updatedProfile);
    
    // Return success response
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. ' + error.message
    });
  }
});

// NEW: API endpoint to delete a profile
app.delete('/api/profile/:userId', (req, res) => {
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
    
    // Get the profile to be deleted
    const profileToDelete = profiles[profileIndex];
    
    // Delete profile photo if it exists
    if (profileToDelete.photoUrl) {
      const photoPath = path.join(__dirname, profileToDelete.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Remove profile from our "database"
    profiles.splice(profileIndex, 1);
    
    console.log('Profile deleted:', userId);
    
    // Return success response
    res.json({
      success: true,
      message: 'Profile deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile. ' + error.message
    });
  }
});

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