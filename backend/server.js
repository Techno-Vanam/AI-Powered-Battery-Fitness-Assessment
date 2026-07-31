const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const ApiResponse = require('./src/utils/response');
const errorHandler = require('./src/middleware/error.middleware');
const weightRoutes = require('./src/routes/weight.routes');
const { testConnection } = require('./src/database/connection');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, config.upload.dir)));

// Health check endpoint
app.get('/health', (req, res) => {
  return ApiResponse.success(res, { status: 'UP', service: 'Weight Measurement API' });
});

// API Routes
app.use('/api/weight-measurements', weightRoutes);

// 404 Handler
app.use((req, res) => {
  return ApiResponse.error(res, `Route ${req.method} ${req.url} not found`, 404);
});

// Global Error Handler
app.use(errorHandler);

// Start server
async function startServer() {
  await testConnection();
  app.listen(config.port, () => {
    logger.info(`🚀 Weight Measurement API server running on port ${config.port} [${config.nodeEnv}]`);
    logger.info(`📍 Base API URL: http://localhost:${config.port}/api/weight-measurements`);
  });
}

startServer();

module.exports = app;
