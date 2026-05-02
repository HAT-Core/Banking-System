const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { intraTransfer } = require('../controllers/transferController');
const { intraTransfer, interTransfer } = require('../controllers/transferController');

router.post('/intra', protect, intraTransfer);
router.post('/inter', protect, interTransfer);

module.exports = router;