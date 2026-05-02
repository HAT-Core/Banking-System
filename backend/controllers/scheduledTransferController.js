const { sql } = require('../config/db');

// POST /api/transfer/scheduled — queue a future intra-bank transfer
const createScheduledTransfer = async (req, res) => {
  const { fromAccountId, toAccountId, amount, scheduledDate } = req.body;
  const userId = req.user.userId;

  if (!fromAccountId || !toAccountId || !amount || !scheduledDate || amount <= 0)
    return res.status(400).json({ message: 'Invalid scheduled transfer details.' });

  if (fromAccountId === toAccountId)
    return res.status(400).json({ message: 'Cannot transfer to the same account.' });

  const scheduled = new Date(scheduledDate);
  if (scheduled <= new Date())
    return res.status(400).json({ message: 'Scheduled date must be in the future.' });

  try {
    // Verify ownership and active status
    const ownerReq = new sql.Request();
    ownerReq.input('fromAccountId', sql.Int, fromAccountId);
    ownerReq.input('userId', sql.Int, userId);
    const ownerResult = await ownerReq.query(`
      SELECT a.account_id, a.balance, a.status
      FROM account a
      JOIN customer c ON a.customer_id = c.customer_id
      WHERE a.account_id = @fromAccountId AND c.user_id = @userId
    `);

    if (ownerResult.recordset.length === 0)
      return res.status(403).json({ message: 'Forbidden: Not your account.' });

    if (ownerResult.recordset[0].status !== 'active')
      return res.status(400).json({ message: 'Sender account is not active.' });

    // Verify recipient exists and is active
    const recipReq = new sql.Request();
    recipReq.input('toAccountId', sql.Int, toAccountId);
    const recipResult = await recipReq.query(`
      SELECT account_id FROM account WHERE account_id = @toAccountId AND status = 'active'
    `);

    if (recipResult.recordset.length === 0)
      return res.status(404).json({ message: 'Recipient account not found or inactive.' });

    // Insert as pending with a future scheduled_date — cron job will execute it
    const insertReq = new sql.Request();
    insertReq.input('fromAccountId', sql.Int, fromAccountId);
    insertReq.input('toAccountId', sql.Int, toAccountId);
    insertReq.input('amount', sql.Decimal(15, 2), amount);
    insertReq.input('scheduledDate', sql.DateTime, scheduled);
    const result = await insertReq.query(`
      INSERT INTO transactions (from_account, to_account, amount, transaction_type, status, scheduled_date)
      OUTPUT INSERTED.transaction_id
      VALUES (@fromAccountId, @toAccountId, @amount, 'internal_transfer', 'pending', @scheduledDate)
    `);

    return res.status(201).json({
      message: 'Transfer scheduled successfully.',
      transaction_id: result.recordset[0].transaction_id,
      scheduled_date: scheduledDate,
    });

  } catch (error) {
    console.error('[scheduledTransferController] createScheduledTransfer error:', error);
    return res.status(500).json({ message: 'Failed to schedule transfer.' });
  }
};

module.exports = { createScheduledTransfer };   