const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getPendingKYCQueue, updateKYCStatus } = require('../controllers/kycController');

router.get('/pending', protect, getPendingKYCQueue);
router.put('/:id/status', protect, updateKYCStatus);

module.exports = router;