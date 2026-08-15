// ===================================================
//  GRAB A CART - Full Stack Node.js / Express Server
// ===================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development friendly)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Grab A Cart API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static frontend files from current directory
app.use(express.static(path.join(__dirname)));

// Root route fallback to ecommerce.html or index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`  🛒 Grab A Cart - Server Started Successfully!`);
  console.log(`  🚀 Server URL: http://localhost:${PORT}`);
  console.log(`  📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`  🔐 Auth API:     http://localhost:${PORT}/api/auth`);
  console.log(`  📋 Orders API:   http://localhost:${PORT}/api/orders`);
  console.log('====================================================');
});
