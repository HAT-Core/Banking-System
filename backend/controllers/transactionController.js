const { sql } = require('../config/db');

const getTransactionHistory = async (req, res) => {
  try {
    const requestingUserId = req.user.userId;
    const userRole = req.user.role;
    const accountId = parseInt(req.params.accountId, 10);
    const { startDate, endDate, type } = req.query;

    if (isNaN(accountId)) {
      return res.status(400).json({ message: 'Invalid account ID provided.' });
    }

    const request = new sql.Request();
    request.input('accountId', sql.Int, accountId);

    if (userRole === 'customer') {
      request.input('userId', sql.Int, requestingUserId);
      const ownershipCheck = await request.query(`
        SELECT a.account_id
        FROM account a
        JOIN customer c ON a.customer_id = c.customer_id
        WHERE a.account_id = @accountId AND c.user_id = @userId
      `);

      if (ownershipCheck.recordset.length === 0) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this account.' });
      }
    }

    let transactionQuery = `
      SELECT
        t.transaction_id, t.from_account, t.to_account, t.amount,
        t.transaction_type, t.transaction_date, t.scheduled_date, t.status,
        CASE
          WHEN t.to_account = @accountId THEN 'credit'
          WHEN t.from_account = @accountId THEN 'debit'
        END AS direction
      FROM transactions t
      WHERE (t.from_account = @accountId OR t.to_account = @accountId)
        AND 1=1
    `;

    if (startDate) {
      request.input('startDate', sql.DateTime, new Date(startDate));
      transactionQuery += ` AND t.transaction_date >= @startDate`;
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      request.input('endDate', sql.DateTime, endOfDay);
      transactionQuery += ` AND t.transaction_date < @endDate`;
    }

    if (type) {
      request.input('type', sql.VarChar(20), type);
      transactionQuery += ` AND t.transaction_type = @type`;
    }

    transactionQuery += ` ORDER BY t.transaction_date DESC`;
    const transactionsResult = await request.query(transactionQuery);

    const summaryRequest = new sql.Request();
    summaryRequest.input('accountId', sql.Int, accountId);
    
    // PATCHED: Changed 'completed' to 'success'
    const summaryResult = await summaryRequest.query(`
      SELECT
        ISNULL(SUM(CASE WHEN to_account = @accountId AND status = 'success' THEN amount ELSE 0 END), 0) AS total_incoming,
        ISNULL(SUM(CASE WHEN from_account = @accountId AND status = 'success' THEN amount ELSE 0 END), 0) AS total_outgoing
      FROM transactions
      WHERE (from_account = @accountId OR to_account = @accountId)
    `);
    const summary = summaryResult.recordset[0];

    const balanceRequest = new sql.Request();
    balanceRequest.input('accountId', sql.Int, accountId);
    const balanceResult = await balanceRequest.query(`
      SELECT balance, account_type, status
      FROM account
      WHERE account_id = @accountId
    `);

    if (balanceResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const accountInfo = balanceResult.recordset[0];

    return res.status(200).json({
      account: {
        account_id: accountId,
        account_type: accountInfo.account_type,
        balance: parseFloat(accountInfo.balance),
        status: accountInfo.status,
      },
      summary: {
        total_incoming: parseFloat(summary.total_incoming),
        total_outgoing: parseFloat(summary.total_outgoing),
        net: parseFloat(summary.total_incoming) - parseFloat(summary.total_outgoing),
      },
      transactions: transactionsResult.recordset.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount),
      })),
      count: transactionsResult.recordset.length,
    });

  } catch (error) {
    console.error('[transactionController] getTransactionHistory error:', error);
    return res.status(500).json({ message: 'Server error. Could not retrieve transactions.' });
  }
};

module.exports = { getTransactionHistory };