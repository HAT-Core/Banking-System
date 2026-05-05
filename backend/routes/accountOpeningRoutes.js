const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCustomersForAccountOpening, openAccount } = require('../controllers/accountOpeningController');

router.get('/customers', protect, getCustomersForAccountOpening);
router.post('/open',     protect, openAccount);

module.exports = router;