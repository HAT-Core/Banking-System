const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { browseBillers, addSubscription, getPendingBills, payBill } = require('../controllers/billController');

// Global Middleware: Every route here requires an active login token
router.use(protect);

// GET /api/bills/billers - Fetch available utility companies
router.get('/billers', browseBillers);

// POST /api/bills/subscribe - Setup a new billing subscription
router.post('/subscribe', addSubscription);

// GET /api/bills/pending - View unpaid bills for the logged-in user
router.get('/pending', getPendingBills);

// POST /api/bills/:billId/pay - Process payment for a specific bill
router.post('/:billId/pay', payBill);

module.exports = router;