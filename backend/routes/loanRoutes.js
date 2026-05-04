const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLoan, payInstallment, getMyLoans, getLoanInstallments } = require('../controllers/loanController');

router.use(protect);

router.post('/create', createLoan);
router.get('/my-loans', getMyLoans);
router.get('/:loanId/installments', getLoanInstallments);
router.post('/pay-installment/:installmentId', payInstallment);

module.exports = router;