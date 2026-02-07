// ================================
// EXPRESS SERVER
// ================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// MIDDLEWARE
// ================================

// CORS - Allow frontend to access API
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================================
// ROUTES
// ================================

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 iStore API is running!',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            health: '/api/health'
        }
    });
});

// API Health
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

// Products API
app.use('/api/products', productsRoutes);

// ================================
// ERROR HANDLING
// ================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ================================
// START SERVER
// ================================

async function startServer() {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
        console.log('========================================');
        console.log(`🚀 iStore API Server`);
        console.log(`📍 Running on: http://localhost:${PORT}`);
        console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
        console.log('========================================');
    });
}

startServer();