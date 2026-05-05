const { sql } = require('../config/db');

// Fetch all customers with their KYC status and existing account count
const getCustomersForAccountOpening = async (req, res) => {
  try {
    const result = await new sql.Request().query(`
      SELECT
        c.customer_id,
        u.first_name,
        u.last_name,
        u.username,
        u.cnic,
        u.phone,
        c.kyc_status,
        COUNT(a.account_id)      AS account_count,
        SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) AS active_accounts
      FROM customer c
      JOIN user_account u ON c.user_id = u.user_id
      LEFT JOIN account a ON a.customer_id = c.customer_id
      GROUP BY c.customer_id, u.first_name, u.last_name, u.username, u.cnic, u.phone, c.kyc_status
      ORDER BY u.first_name ASC
    `);
    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error('[accountOpeningController] getCustomers error:', error);
    return res.status(500).json({ message: 'Failed to fetch customers.' });
  }
};

// Open a new bank account for a customer
const openAccount = async (req, res) => {
  const { customerId, accountType, initialDeposit } = req.body;
  const employeeUserId = req.user.userId;

  if (!customerId || !accountType)
    return res.status(400).json({ message: 'customerId and accountType are required.' });

  if (accountType !== 'savings' && accountType !== 'current')
    return res.status(400).json({ message: "accountType must be 'savings' or 'current'." });

  const deposit = parseFloat(initialDeposit) || 0;
  if (deposit < 0)
    return res.status(400).json({ message: 'Initial deposit cannot be negative.' });

  const transaction = new sql.Transaction();

  try {
    // Get employee_id from user_id
    const empReq = new sql.Request();
    empReq.input('userId', sql.Int, employeeUserId);
    const empResult = await empReq.query(`SELECT employee_id FROM employee WHERE user_id = @userId`);
    if (empResult.recordset.length === 0)
      return res.status(403).json({ message: 'No employee profile found for your account.' });
    const employeeId = empResult.recordset[0].employee_id;

    await transaction.begin();
    const request = new sql.Request(transaction);

    // Verify customer exists and is KYC verified
    request.input('customerId', sql.Int, customerId);
    const custResult = await request.query(`
      SELECT c.customer_id, c.kyc_status FROM customer c WHERE c.customer_id = @customerId
    `);
    if (custResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Customer not found.' });
    }
    if (custResult.recordset[0].kyc_status !== 'verified') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Customer KYC is not verified. Cannot open account.' });
    }

    request.input('accountType',  sql.VarChar(10),   accountType);
    request.input('deposit',      sql.Decimal(15, 2), deposit);
    request.input('employeeId',   sql.Int,            employeeId);

    const accountResult = await request.query(`
      INSERT INTO account (customer_id, account_type, balance, created_by_employee, status)
      OUTPUT INSERTED.account_id
      VALUES (@customerId, @accountType, @deposit, @employeeId, 'active')
    `);

    const newAccountId = accountResult.recordset[0].account_id;

    // Log initial deposit as a transaction if deposit > 0
    if (deposit > 0) {
      const txReq = new sql.Request(transaction);
      txReq.input('accountId', sql.Int,            newAccountId);
      txReq.input('amount',    sql.Decimal(15, 2), deposit);
      await txReq.query(`
        INSERT INTO transactions (from_account, to_account, amount, transaction_type, status, transaction_date)
        VALUES (NULL, @accountId, @amount, 'deposit', 'success', GETDATE())
      `);
    }

    // Audit log
    const auditReq = new sql.Request(transaction);
    auditReq.input('employeeUserId', sql.Int,          employeeUserId);
    auditReq.input('accountId',      sql.Int,           newAccountId);
    auditReq.input('action',         sql.VarChar(1023), `Opened ${accountType} account for customer ${customerId} with initial deposit ${deposit}`);
    await auditReq.query(`
      INSERT INTO audit_log (user_id, record_id, action, table_name)
      VALUES (@employeeUserId, @accountId, @action, 'account')
    `);

    await transaction.commit();
    return res.status(201).json({ message: 'Account opened successfully.', account_id: newAccountId });

  } catch (error) {
    if (transaction._aborted === false) await transaction.rollback();
    console.error('[accountOpeningController] openAccount error:', error);
    return res.status(500).json({ message: 'Failed to open account.' });
  }
};

module.exports = { getCustomersForAccountOpening, openAccount };