const { sql } = require('../config/db');

const getStatement = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { month, year } = req.query;
    const userId = req.user.userId;

    if (!month || !year) return res.status(400).json({ message: 'month and year are required.' });

    // Ownership check
    const ownerReq = new sql.Request();
    ownerReq.input('accountId', sql.Int, parseInt(accountId));
    ownerReq.input('userId', sql.Int, userId);
    const ownerResult = await ownerReq.query(`
      SELECT a.account_id FROM account a
      JOIN customer c ON a.customer_id = c.customer_id
      WHERE a.account_id = @accountId AND c.user_id = @userId
    `);
    if (ownerResult.recordset.length === 0)
      return res.status(403).json({ message: 'Forbidden: Not your account.' });

    const request = new sql.Request();
    request.input('accountId', sql.Int, parseInt(accountId));
    request.input('month',     sql.Int, parseInt(month));
    request.input('year',      sql.Int, parseInt(year));

    const result = await request.execute('sp_generate_statement');

    return res.status(200).json({
      transactions: result.recordsets[0],
      summary:      result.recordsets[1][0],
    });
  } catch (error) {
    console.error('[statementController] getStatement error:', error);
    return res.status(500).json({ message: 'Failed to generate statement.' });
  }
};

module.exports = { getStatement };