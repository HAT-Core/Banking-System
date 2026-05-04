const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { browseBillers, addSubscription, getPendingBills, payBill } = require('../controllers/billController');

router.use(protect);
router.get('/billers', browseBillers);
router.post('/subscribe', addSubscription);
router.get('/pending', getPendingBills);
router.post('/:billId/pay', payBill);

module.exports = router;