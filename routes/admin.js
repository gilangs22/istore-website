const express = require('express');
const router = express.Router();
const path = require('path');

// ============================================
// ADMIN PAGES (HTML)
// ============================================

// Admin Login Page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Admin Dashboard
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Products Page
router.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Categories Page  
router.get('/categories', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Add Product Page
router.get('/products/add', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Edit Product Page
router.get('/products/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Orders Page
router.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// Settings Page
router.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
});

// ============================================
// ADMIN API (Optional - for future features)
// ============================================

// Login API (simple version)
router.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple hardcoded auth
  // TODO: Replace with database authentication
  if (username === 'admin' && password === 'admin123') {
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { username: 'admin', role: 'admin' }
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });
  }
});

// Logout API
router.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check Auth Status
router.get('/api/auth/status', (req, res) => {
  // TODO: Implement session checking
  res.json({ 
    success: true, 
    authenticated: false 
  });
});

module.exports = router;
