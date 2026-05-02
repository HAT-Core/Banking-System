const express = require('express');
const router = express.Router();
const {protect,authorizeAdmin} = require('../middleware/authMiddleware');

const {getBanks,addBank,getBillers,addBiller,getLoans,updateLoanRate,getEmployees,
     getCustomers,updateUserStatus, getDashboardStats} = require('../controllers/adminController');

router.get('/catalogs/banks',protect,authorizeAdmin,getBanks);
router.post('/catalogs/banks',protect,authorizeAdmin,addBank);

router.get('/catalogs/billers',protect,authorizeAdmin,getBillers);
router.post('/catalogs/billers',protect,authorizeAdmin,addBiller);

router.get('/catalogs/loans',protect,authorizeAdmin,getLoans);
router.put('/catalogs/loans/:id',protect,authorizeAdmin,updateLoanRate);

router.get('/users/employees',protect,authorizeAdmin,getEmployees);
router.get('/users/customers',protect,authorizeAdmin,getCustomers);
router.put('/users/:id/status',protect,authorizeAdmin,updateUserStatus);

router.get('/dashboard/stats', protect, authorizeAdmin, getDashboardStats);

module.exports = router;