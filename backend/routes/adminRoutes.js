const express = require('express');
const router = express.Router();
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// We will import the controllers here later
// const { getBanks, addBank, getEmployees, updateStatus } = require('../controllers/adminController');

// --- SYSTEM CATALOG ROUTES ---
// router.get('/banks', protect, authorizeAdmin, getBanks);
// router.post('/banks', protect, authorizeAdmin, addBank);

// --- USER MANAGEMENT ROUTES ---
// router.get('/users/employees', protect, authorizeAdmin, getEmployees);
// router.put('/users/:id/status', protect, authorizeAdmin, updateStatus);

module.exports = router;