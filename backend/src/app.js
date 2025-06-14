const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Define routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import routes
const userRoutes = require('./routes/user.router');
const entityRoutes = require('./routes/entity.router');
const offersRoutes = require('./routes/offers.router');
const { authenticateToken } = require('./middleware/auth');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/offers', offersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;