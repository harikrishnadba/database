require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Middleware
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use(helmet()); // Adds security headers
app.use(cors()); // Enables Cross-Origin Resource Sharing

// Routes
app.use('/api', userRoutes); // Ensure this matches the path used in requests

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
