const { sql } = require('../config/db');

// POST /api/branch/transaction — employee physically deposits or withdraws cash for a customer
const branchTransaction = async (req, res) => {
  const { accountId, type, amount } = req.body;
  const employeeUserId = req.user.userId;

  if (!accountId || !amount || !type || amount <= 0)
    return res.status(400).json({ message: 'Invalid transaction details.' });

  if (type !== 'deposit' && type !== 'withdraw')
    return res.status(400).json({ message: "Type must be 'deposit' or 'withdraw'." });

  // Only employees and admins can process branch transactions
  if (req.user.role !== 'employee' && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden: Staff access only.' });

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    // Fetch account and verify it's active
    const accountReq = new sql.Request(transaction);
    accountReq.input('accountId', sql.Int, accountId);
    const accountResult = await accountReq.query(`
      SELECT account_id, balance, status FROM account WHERE account_id = @accountId
    `);

    if (accountResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Account not found.' });
    }

    const account = accountResult.recordset[0];

    if (account.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Account is not active.' });
    }

    if (type === 'withdraw' && parseFloat(account.balance) < amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    // Update balance
    const balanceReq = new sql.Request(transaction);
    balanceReq.input('amount', sql.Decimal(15, 2), amount);
    balanceReq.input('accountId', sql.Int, accountId);
    await balanceReq.query(
      type === 'deposit'
        ? `UPDATE account SET balance = balance + @amount WHERE account_id = @accountId`
        : `UPDATE account SET balance = balance - @amount WHERE account_id = @accountId`
    );

    // Log in transactions — deposit: from_account NULL, withdraw: to_account NULL
    const txReq = new sql.Request(transaction);
    txReq.input('accountId', sql.Int, accountId);
    txReq.input('amount', sql.Decimal(15, 2), amount);
    txReq.input('type', sql.VarChar(20), type);
    const txResult = await txReq.query(`
      INSERT INTO transactions (from_account, to_account, amount, transaction_type, status, transaction_date)
      OUTPUT INSERTED.transaction_id
      VALUES (
        ${type === 'withdraw' ? '@accountId' : 'NULL'},
        ${type === 'deposit'  ? '@accountId' : 'NULL'},
        @amount, @type, 'success', GETDATE()
      )
    `);

    // Audit log — record which employee processed this
    const auditReq = new sql.Request(transaction);
    auditReq.input('employeeUserId', sql.Int, employeeUserId);
    auditReq.input('transactionId', sql.Int, txResult.recordset[0].transaction_id);
    auditReq.input('action', sql.VarChar(1023), `Branch ${type} of ${amount} on account ${accountId}`);
    await auditReq.query(`
      INSERT INTO audit_log (user_id, record_id, action, table_name)
      VALUES (@employeeUserId, @transactionId, @action, 'transactions')
    `);

    await transaction.commit();

    return res.status(200).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} successful.`,
      transaction_id: txResult.recordset[0].transaction_id,
    });

  } catch (error) {
    if (transaction._aborted === false) await transaction.rollback();
    console.error('[branchController] branchTransaction error:', error);
    return res.status(500).json({ message: 'Transaction failed. No funds were moved.' });
  }
};

module.exports = { branchTransaction };