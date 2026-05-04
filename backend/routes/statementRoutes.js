const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getStatement } = require('../controllers/statementController');

router.get('/:accountId', protect, getStatement);

module.exports = router;