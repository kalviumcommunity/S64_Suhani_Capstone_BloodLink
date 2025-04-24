const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email_verified, email, name, sub } = ticket.getPayload();
    
    if (!email_verified) {
      return res.status(400).json({ error: 'Google email not verified' });
    }

    let user = await User.findOne({ email });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = new User({ 
        name, 
        email, 
        googleId: sub 
      });
      await user.save();
    } 
    // If user exists but doesn't have googleId, update the user
    else if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Don't send password in the response
    const { password, ...userWithoutPassword } = user.toObject();
    
    res.json({ 
      token, 
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
};