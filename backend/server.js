// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const http = require('http');
// const connectDB = require('./config/db');
// const { setupWebSocket } = require('./socket');

// // Load environment variables from .env
// dotenv.config();

// // Create Express app
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Route Test (Optional Debugging Route)
// app.get('/api/test', (req, res) => {
//   res.send('✅ API is working!');
// });

// // ✅ Load Routes
// const authRoutes = require('./routes/authRoutes');
// const slotRoutes = require('./routes/slotRoutes');
// const centerRoutes = require('./routes/centerRoutes');
// const notifyRoutes = require('./routes/notifyRoutes');

// // ✅ Use Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/slots', slotRoutes);
// app.use('/api/centers', centerRoutes); // <-- Important one!
// app.use('/api/notify', notifyRoutes);

// // ✅ Log that routes are loaded
// console.log('✅ All routes registered');

// // Create HTTP server for WebSocket
// const server = http.createServer(app);

// // Connect to MongoDB and start server
// connectDB().then(() => {
//   // WebSocket setup
//   setupWebSocket(server);

//   // Start server
//   const PORT = process.env.PORT || 5000;
//   server.listen(PORT, () => {
//     console.log(`✅ Server running on http://localhost:${PORT}`);
//   });
// }).catch((err) => {
//   console.error('❌ Failed to start server:', err.message);
// });
const express = require("express")
const app = express();
const PORT = process.env.PORT || 5000;
app.get('/api/test', (req, res) => {
  res.send('✅ API is working!');
});
app.listen(PORT,()=>{
  console.log("Server started on port 5000");
});