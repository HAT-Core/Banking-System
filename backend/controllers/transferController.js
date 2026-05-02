const sql = require('mssql');
const db = require('../config/db');

const intraTransfer = async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  const userId = req.user.userId;

  if (!fromAccountId || !toAccountId || !amount || amount <= 0)
    return res.status(400).json({ message: 'Invalid transfer details.' });

  if (fromAccountId === toAccountId)
    return res.status(400).json({ message: 'Cannot transfer to the same account.' });

  const pool = await db.getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const ownerCheck = new sql.Request(transaction);
    ownerCheck.input('fromAccountId', sql.Int, fromAccountId);
    ownerCheck.input('userId', sql.Int, userId);
    const ownerResult = await ownerCheck.query(`
      SELECT a.account_id, a.balance, a.status
      FROM account a
      JOIN customer c ON a.customer_id = c.customer_id
      WHERE a.account_id = @fromAccountId AND c.user_id = @userId
    `);

    if (ownerResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Forbidden: Not your account.' });
    }

    const sender = ownerResult.recordset[0];

    if (sender.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Sender account is not active.' });
    }

    if (parseFloat(sender.balance) < amount) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    const recipientCheck = new sql.Request(transaction);
    recipientCheck.input('toAccountId', sql.Int, toAccountId);
    const recipientResult = await recipientCheck.query(`
      SELECT account_id, status FROM account WHERE account_id = @toAccountId
    `);

    if (recipientResult.recordset.length === 0 || recipientResult.recordset[0].status !== 'active') {
      await transaction.rollback();
      return res.status(404).json({ message: 'Recipient account not found or inactive.' });
    }

    const deduct = new sql.Request(transaction);
    deduct.input('amount', sql.Decimal(18, 2), amount);
    deduct.input('fromAccountId', sql.Int, fromAccountId);
    await deduct.query(`
      UPDATE account SET balance = balance - @amount WHERE account_id = @fromAccountId
    `);

    const credit = new sql.Request(transaction);
    credit.input('amount', sql.Decimal(18, 2), amount);
    credit.input('toAccountId', sql.Int, toAccountId);
    await credit.query(`
      UPDATE account SET balance = balance + @amount WHERE account_id = @toAccountId
    `);

    const log = new sql.Request(transaction);
    log.input('fromAccountId', sql.Int, fromAccountId);
    log.input('toAccountId', sql.Int, toAccountId);
    log.input('amount', sql.Decimal(18, 2), amount);
    
    // PATCHED: Changed 'transfer' to 'internal_transfer' and 'completed' to 'success'
    const logResult = await log.query(`
      INSERT INTO transactions (from_account, to_account, amount, transaction_type, status, transaction_date)
      OUTPUT INSERTED.transaction_id
      VALUES (@fromAccountId, @toAccountId, @amount, 'internal_transfer', 'success', GETDATE())
    `);

    await transaction.commit();

    return res.status(200).json({
      message: 'Transfer successful.',
      transaction_id: logResult.recordset[0].transaction_id,
    });

  } catch (error) {
    if (transaction._aborted === false) await transaction.rollback();
    console.error('[transferController] intraTransfer error:', error);
    return res.status(500).json({ message: 'Transfer failed. No funds were moved.' });
  }
};

module.exports = { intraTransfer };