const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLoan, payInstallment, getMyLoans, getLoanInstallments, getLoanTypes } = require('../controllers/loanController');

router.use(protect);

router.get('/types', getLoanTypes);

router.post('/create', createLoan);
router.get('/my-loans', getMyLoans);
router.get('/:loanId/installments', getLoanInstallments);
router.post('/pay-installment/:installmentId', payInstallment);

module.exports = router;