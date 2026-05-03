const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { branchTransaction } = require('../controllers/branchController');

router.post('/transaction', protect, branchTransaction);

module.exports = router;