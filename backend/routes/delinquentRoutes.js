const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDelinquentAccounts, freezeAccount, unfreezeAccount } = require('../controllers/delinquentController');

router.use(protect);

router.get('/',                        getDelinquentAccounts);
router.patch('/:accountId/freeze',     freezeAccount);
router.patch('/:accountId/unfreeze',   unfreezeAccount);

module.exports = router;
