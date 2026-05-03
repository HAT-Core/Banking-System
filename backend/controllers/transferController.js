const { sql } = require('../config/db');

const intraTransfer = async (req, res) => {
  const { fromAccountId, toAccountId, amount } = req.body;
  const userId = req.user.userId;

  if (!fromAccountId || !toAccountId || !amount || amount <= 0)
    return res.status(400).json({ message: 'Invalid transfer details.' });

  if (fromAccountId === toAccountId)
    return res.status(400).json({ message: 'Cannot transfer to the same account.' });

  const transaction = new sql.Transaction();

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

const interTransfer = async (req, res) => {
  const { fromAccountId, amount, toBankId, toAccountNumber } = req.body;
  const userId = req.user.userId;

  if (!fromAccountId || !amount || !toBankId || !toAccountNumber || amount <= 0)
    return res.status(400).json({ message: 'Invalid transfer details.' });

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    const ownerReq = new sql.Request(transaction);
    ownerReq.input('fromAccountId', sql.Int, fromAccountId);
    ownerReq.input('userId', sql.Int, userId);
    const ownerResult = await ownerReq.query(`
      SELECT a.account_id, a.balance, a.status, CAST(a.account_id AS VARCHAR(30)) AS account_number
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

    const bankReq = new sql.Request(transaction);
    bankReq.input('toBankId', sql.Int, toBankId);
    const bankResult = await bankReq.query(`
      SELECT bank_id FROM supported_bank WHERE bank_id = @toBankId AND is_active = 1
    `);

    if (bankResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Destination bank not found or inactive.' });
    }

    const deductReq = new sql.Request(transaction);
    deductReq.input('amount', sql.Decimal(15, 2), amount);
    deductReq.input('fromAccountId', sql.Int, fromAccountId);
    await deductReq.query(`
      UPDATE account SET balance = balance - @amount WHERE account_id = @fromAccountId
    `);

    const txReq = new sql.Request(transaction);
    txReq.input('fromAccountId', sql.Int, fromAccountId);
    txReq.input('amount', sql.Decimal(15, 2), amount);
    const txResult = await txReq.query(`
      INSERT INTO transactions (from_account, to_account, amount, transaction_type, status, transaction_date)
      OUTPUT INSERTED.transaction_id
      VALUES (@fromAccountId, NULL, @amount, 'external_transfer', 'pending', GETDATE())
    `);

    const transactionId = txResult.recordset[0].transaction_id;

    const ibReq = new sql.Request(transaction);
    ibReq.input('transactionId', sql.Int, transactionId);
    ibReq.input('fromBankId', sql.Int, parseInt(process.env.OWN_BANK_ID));
    ibReq.input('fromAccountNumber', sql.VarChar(30), sender.account_number);
    ibReq.input('toBankId', sql.Int, toBankId);
    ibReq.input('toAccountNumber', sql.VarChar(30), toAccountNumber);
    await ibReq.query(`
      INSERT INTO interbank_transfer 
        (transaction_id, from_bank_id, from_account_number, to_bank_id, to_account_number, settlement_status)
      VALUES 
        (@transactionId, @fromBankId, @fromAccountNumber, @toBankId, @toAccountNumber, 'pending')
    `);

    await transaction.commit();

    return res.status(200).json({
      message: 'Interbank transfer initiated. Settlement pending.',
      transaction_id: transactionId,
    });

  } catch (error) {
    if (transaction._aborted === false) await transaction.rollback();
    console.error('[transferController] interTransfer error:', error);
    return res.status(500).json({ message: 'Transfer failed. No funds were moved.' });
  }
};

module.exports = { intraTransfer, interTransfer };