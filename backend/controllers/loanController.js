const { sql } = require('../config/db');

const createLoan = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only authorized staff can issue loans." });
        }

        const { accountId, loanTypeId, amount, durationMonths } = req.body;

        const request = new sql.Request();
        request.input('userId', sql.Int, req.user.userId);
        const empResult = await request.query(`SELECT employee_id FROM employee WHERE user_id = @userId`);
        
        if (empResult.recordset.length === 0) {
            return res.status(403).json({ message: "Action failed: Your account lacks an associated employee profile." });
        }
        const employeeId = empResult.recordset[0].employee_id;

        await transaction.begin();
        const txRequest = new sql.Request(transaction);

        txRequest.input('accountId', sql.Int, accountId);
        txRequest.input('loanTypeId', sql.Int, loanTypeId);
        txRequest.input('employeeId', sql.Int, employeeId);
        txRequest.input('amount', sql.Decimal(15, 2), amount);
        txRequest.input('durationMonths', sql.Int, durationMonths);

        const loanResult = await txRequest.query(`
            INSERT INTO loan (account_id, loan_type_id, approved_by_employee, amount, start_date, end_date, status)
            OUTPUT INSERTED.loan_id
            VALUES (@accountId, @loanTypeId, @employeeId, @amount, GETDATE(), DATEADD(month, @durationMonths, GETDATE()), 'running')
        `);

        const newLoanId = loanResult.recordset[0].loan_id;
        const installmentAmount = (amount / durationMonths).toFixed(2);

        for (let i = 1; i <= durationMonths; i++) {
            const instRequest = new sql.Request(transaction);
            instRequest.input('loanId', sql.Int, newLoanId);
            instRequest.input('amount', sql.Decimal(15, 2), installmentAmount);
            instRequest.input('monthsToAdd', sql.Int, i);
            
            await instRequest.query(`
                INSERT INTO installment (loan_id, due_date, amount, status)
                VALUES (@loanId, DATEADD(month, @monthsToAdd, GETDATE()), @amount, 'pending')
            `);
        }

        await transaction.commit();
        res.status(201).json({ message: "Loan successfully created and installments generated." });

    } catch (error) {
        if (transaction.isActive) {
            await transaction.rollback();
        }
        console.error("Create loan error:", error);
        res.status(500).json({ message: "Server error during loan creation." });
    }
};

const payInstallment = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: "Forbidden: Only customers can pay installments." });
        }

        const { installmentId } = req.params;

        await transaction.begin();
        const request = new sql.Request(transaction);
        
        request.input('installmentId', sql.Int, installmentId);
        request.input('userId', sql.Int, req.user.userId);

        const instResult = await request.query(`
            SELECT i.amount, i.status, l.account_id, a.balance, c.user_id 
            FROM installment i
            JOIN loan l ON i.loan_id = l.loan_id
            JOIN account a ON l.account_id = a.account_id
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE i.installment_id = @installmentId
        `);

        if (instResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Installment not found." });
        }

        const { amount, status, account_id, balance, user_id } = instResult.recordset[0];

        if (user_id !== req.user.userId) {
            await transaction.rollback();
            return res.status(403).json({ message: "Forbidden: You do not own this loan." });
        }

        if (status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ message: "Installment is already paid or overdue." });
        }

        if (balance < amount) {
            await transaction.rollback();
            return res.status(400).json({ message: "Insufficient account balance to pay this installment." });
        }

        request.input('accountId', sql.Int, account_id);
        request.input('amount', sql.Decimal(15, 2), amount);

        await request.query(`
            UPDATE account 
            SET balance = balance - @amount 
            WHERE account_id = @accountId
        `);

        const txResult = await request.query(`
            INSERT INTO transactions (from_account, to_account, amount, transaction_type, status)
            OUTPUT INSERTED.transaction_id
            VALUES (@accountId, NULL, @amount, 'loan', 'success')
        `);
        
        const newTransactionId = txResult.recordset[0].transaction_id;
        request.input('transactionId', sql.Int, newTransactionId);

        await request.query(`
            UPDATE installment 
            SET status = 'paid', 
                paid_date = GETDATE(),
                transaction_id = @transactionId
            WHERE installment_id = @installmentId
        `);

        await transaction.commit();
        res.status(200).json({ message: "Installment paid successfully." });

    } catch (error) {
        if (transaction.isActive) {
            await transaction.rollback();
        }
        console.error("Pay installment error:", error);
        res.status(500).json({ message: "Server error during installment payment." });
    }
};

const getMyLoans = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: "Forbidden: Only customers can view their loans." });
        }

        const request = new sql.Request();
        request.input('userId', sql.Int, req.user.userId);

        const result = await request.query(`
            SELECT l.loan_id, l.amount, l.start_date, l.end_date, l.status, lt.type_name, lt.interest_rate
            FROM loan l
            JOIN loan_type lt ON l.loan_type_id = lt.loan_type_id
            JOIN account a ON l.account_id = a.account_id
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE c.user_id = @userId
            ORDER BY l.start_date DESC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Get my loans error:", error);
        res.status(500).json({ message: "Server error. Could not retrieve loans." });
    }
};

module.exports = { createLoan, payInstallment, getMyLoans };