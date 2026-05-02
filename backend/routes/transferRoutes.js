const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { intraTransfer } = require('../controllers/transferController');

router.post('/intra', protect, intraTransfer);

module.exports = router;