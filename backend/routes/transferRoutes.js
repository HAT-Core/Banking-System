const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { intraTransfer, interTransfer } = require('../controllers/transferController');
const { createScheduledTransfer } = require('../controllers/scheduledTransferController');

router.post('/intra', protect, intraTransfer);
router.post('/inter', protect, interTransfer);
router.post('/scheduled', protect, createScheduledTransfer);

module.exports = router;