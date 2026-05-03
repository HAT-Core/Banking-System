const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLoan, payInstallment, getMyLoans } = require('../controllers/loanController');

// 1. Global Middleware: Ensure user is logged in for ALL routes below
router.use(protect);

// 2. Employee Route: Issue a new loan (Role checked inside controller)
router.post('/create', createLoan);

// 3. Customer Routes: View and pay loans
router.get('/my-loans', getMyLoans);
router.post('/pay-installment/:installmentId', payInstallment);

module.exports = router;