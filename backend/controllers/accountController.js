const { sql } = require('../config/db');

// GET /api/accounts/my — returns all accounts belonging to the logged-in customer
const getMyAccounts = async (req, res) => {
  try {
    const request = new sql.Request();
    request.input('userId', sql.Int, req.user.userId);
    const result = await request.query(`
      SELECT a.account_id, a.account_type, a.balance, a.status, a.created_at
      FROM account a
      JOIN customer c ON a.customer_id = c.customer_id
      WHERE c.user_id = @userId AND a.status != 'closed'
    `);
    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error('[accountController] getMyAccounts error:', error);
    return res.status(500).json({ message: 'Failed to fetch accounts.' });
  }
};

module.exports = { getMyAccounts };