const express    = require('express');
const router     = express.Router();

// Import the security guard from Person A's auth system
const { protect } = require('../middleware/authMiddleware');

// Import the controller functions this route will hand off to
const { getTransactionHistory } = require('../controllers/transactionController');
router.get('/:accountId', protect, getTransactionHistory);

module.exports = router;