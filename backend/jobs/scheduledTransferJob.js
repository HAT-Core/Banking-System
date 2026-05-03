const cron = require('node-cron');
const { sql } = require('../config/db');

// Runs every day at midnight — processes all pending transfers due today or earlier
const runScheduledTransfers = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[cron] Running scheduled transfers job...');

    try {
      // Fetch all pending transfers whose scheduled_date has passed
      const fetchReq = new sql.Request();
      fetchReq.input('now', sql.DateTime, new Date());
      const due = await fetchReq.query(`
        SELECT transaction_id, from_account, to_account, amount
        FROM transactions
        WHERE status = 'pending'
          AND transaction_type = 'internal_transfer'
          AND scheduled_date <= @now
          AND scheduled_date IS NOT NULL
      `);

      if (due.recordset.length === 0) {
        console.log('[cron] No scheduled transfers due.');
        return;
      }

      for (const tx of due.recordset) {
        const transaction = new sql.Transaction();
        try {
          await transaction.begin();

          // Re-check sender balance at execution time
          const balReq = new sql.Request(transaction);
          balReq.input('fromAccount', sql.Int, tx.from_account);
          const balResult = await balReq.query(`
            SELECT balance, status FROM account WHERE account_id = @fromAccount
          `);

          const sender = balResult.recordset[0];

          if (!sender || sender.status !== 'active' || parseFloat(sender.balance) < tx.amount) {
            // Mark as failed — insufficient funds or account locked since scheduling
            const failReq = new sql.Request(transaction);
            failReq.input('txId', sql.Int, tx.transaction_id);
            await failReq.query(`
              UPDATE transactions SET status = 'failed' WHERE transaction_id = @txId
            `);
            await transaction.commit();
            console.log(`[cron] Transfer ${tx.transaction_id} failed — insufficient funds or inactive account.`);
            continue;
          }

          // Deduct from sender
          const deductReq = new sql.Request(transaction);
          deductReq.input('amount', sql.Decimal(15, 2), tx.amount);
          deductReq.input('fromAccount', sql.Int, tx.from_account);
          await deductReq.query(`
            UPDATE account SET balance = balance - @amount WHERE account_id = @fromAccount
          `);

          // Credit receiver
          const creditReq = new sql.Request(transaction);
          creditReq.input('amount', sql.Decimal(15, 2), tx.amount);
          creditReq.input('toAccount', sql.Int, tx.to_account);
          await creditReq.query(`
            UPDATE account SET balance = balance + @amount WHERE account_id = @toAccount
          `);

          // Mark transaction as success
          const successReq = new sql.Request(transaction);
          successReq.input('txId', sql.Int, tx.transaction_id);
          await successReq.query(`
            UPDATE transactions SET status = 'success', transaction_date = GETDATE()
            WHERE transaction_id = @txId
          `);

          await transaction.commit();
          console.log(`[cron] Transfer ${tx.transaction_id} executed successfully.`);

        } catch (innerError) {
          if (transaction._aborted === false) await transaction.rollback();
          console.error(`[cron] Transfer ${tx.transaction_id} threw an error:`, innerError);
        }
      }

    } catch (error) {
      console.error('[cron] Scheduled transfer job failed:', error);
    }
  });

  console.log('[cron] Scheduled transfer job registered — runs daily at midnight.');
};

module.exports = { runScheduledTransfers };