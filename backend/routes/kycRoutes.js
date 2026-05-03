const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPendingKYCQueue, updateKYCStatus } = require('../controllers/kycController');

// GET /api/kyc/pending - Fetch the pending verification queue
router.get('/pending', protect, getPendingKYCQueue);

// PUT /api/kyc/:id/status - Update a specific customer's KYC status
router.put('/:id/status', protect, updateKYCStatus);

module.exports = router;