const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyAccounts } = require('../controllers/accountController');

router.get('/my', protect, getMyAccounts);

module.exports = router;