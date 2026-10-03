const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
require('dotenv').config();
const dns = require('dns');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { errorHandler, notFound } = require('./src/middlewares/errorMiddleware');
const { apiLimiter } = require('./src/middlewares/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Fix for local ISP DNS SRV refusal issues (querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '1.1.1.1']);
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const rankingRoutes = require('./src/routes/rankingRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Apply rate limiter
app.use('/api', apiLimiter);

// Swagger Document Loading
const swaggerPath = path.join(__dirname, 'docs', 'swagger.yaml');
const fallbackSwaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');

let swaggerDocument;
if (fs.existsSync(swaggerPath)) {
  swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else if (fs.existsSync(fallbackSwaggerPath)) {
  swaggerDocument = YAML.load(fallbackSwaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.warn('Warning: docs/swagger.yaml not found. /api-docs route disabled.');
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rankings', rankingRoutes);

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'IntelliHire API is running' });
});

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});