const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createScheduledTransfer } = require('../controllers/scheduledTransferController');

router.post('/scheduled', protect, createScheduledTransfer);

module.exports = router;