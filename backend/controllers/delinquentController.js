const { sql } = require('../config/db');

// Call sp_mark_overdue_installments then return delinquent accounts
// filtered by a minimum overdue count threshold (default 1).
const getDelinquentAccounts = async (req, res) => {
    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }

        const threshold = parseInt(req.query.threshold) || 1;

        // First, refresh overdue statuses
        const markRequest = new sql.Request();
        await markRequest.query(`EXEC sp_mark_overdue_installments`);

        // Then query the view, filtering by threshold
        const fetchRequest = new sql.Request();
        fetchRequest.input('threshold', sql.Int, threshold);
        const result = await fetchRequest.query(`
            SELECT *
            FROM delinquent_accounts_view
            WHERE overdue_count >= @threshold
            ORDER BY overdue_count DESC, total_overdue_amount DESC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('getDelinquentAccounts error:', error);
        res.status(500).json({ message: 'Server error. Could not retrieve delinquent accounts.' });
    }
};

// Freeze a specific account via stored procedure
const freezeAccount = async (req, res) => {
    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }

        const { accountId } = req.params;

        // Resolve employee_id from logged-in user
        const empRequest = new sql.Request();
        empRequest.input('userId', sql.Int, req.user.userId);
        const empResult = await empRequest.query(
            `SELECT employee_id FROM employee WHERE user_id = @userId`
        );

        if (empResult.recordset.length === 0) {
            return res.status(403).json({ message: 'No employee profile linked to this account.' });
        }

        const employeeId = empResult.recordset[0].employee_id;

        const freezeRequest = new sql.Request();
        freezeRequest.input('account_id',  sql.Int, parseInt(accountId));
        freezeRequest.input('employee_id', sql.Int, employeeId);
        await freezeRequest.query(`
            EXEC sp_freeze_account @account_id, @employee_id
        `);

        res.status(200).json({ message: `Account ${accountId} has been frozen successfully.` });
    } catch (error) {
        console.error('freezeAccount error:', error);
        res.status(500).json({ message: 'Server error. Could not freeze account.' });
    }
};

// Unfreeze a specific account via stored procedure
const unfreezeAccount = async (req, res) => {
    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }

        const { accountId } = req.params;

        const empRequest = new sql.Request();
        empRequest.input('userId', sql.Int, req.user.userId);
        const empResult = await empRequest.query(
            `SELECT employee_id FROM employee WHERE user_id = @userId`
        );

        if (empResult.recordset.length === 0) {
            return res.status(403).json({ message: 'No employee profile linked to this account.' });
        }

        const employeeId = empResult.recordset[0].employee_id;

        const unfreezeRequest = new sql.Request();
        unfreezeRequest.input('account_id',  sql.Int, parseInt(accountId));
        unfreezeRequest.input('employee_id', sql.Int, employeeId);
        await unfreezeRequest.query(`
            EXEC sp_unfreeze_account @account_id, @employee_id
        `);

        res.status(200).json({ message: `Account ${accountId} has been unfrozen successfully.` });
    } catch (error) {
        console.error('unfreezeAccount error:', error);
        res.status(500).json({ message: 'Server error. Could not unfreeze account.' });
    }
};

module.exports = { getDelinquentAccounts, freezeAccount, unfreezeAccount };
