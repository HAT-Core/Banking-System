const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMyAccounts } = require('../controllers/accountController');
const { getMyAccounts, getActiveBanks } = require('../controllers/accountController');

router.get('/my', protect, getMyAccounts);
router.get('/banks', protect, getActiveBanks);

module.exports = router;