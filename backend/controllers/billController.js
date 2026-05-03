const { sql } = require('../config/db');

const browseBillers = async (req, res) => {
    try {
        const result = await sql.query(`SELECT biller_id, name, category FROM biller ORDER BY name ASC`);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Browse billers error:", error);
        res.status(500).json({ message: "Failed to fetch billers." });
    }
};

const addSubscription = async (req, res) => {
    try {
        const { accountId, billerId, referenceNumber, billingDay, amount, autoPay } = req.body;
        const userId = req.user.userId;

        const request = new sql.Request();
        
        request.input('accountId', sql.Int, accountId);
        request.input('userId', sql.Int, userId);
        const ownershipCheck = await request.query(`
            SELECT a.account_id 
            FROM account a
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE a.account_id = @accountId AND c.user_id = @userId
        `);

        if (ownershipCheck.recordset.length === 0) {
            return res.status(403).json({ message: "Forbidden: You do not own this account." });
        }

        request.input('billerId', sql.Int, billerId);
        request.input('referenceNumber', sql.VarChar(50), referenceNumber);
        request.input('billingDay', sql.Int, billingDay);
        request.input('amount', sql.Decimal(15, 2), amount);
        request.input('autoPay', sql.Bit, autoPay);

        await request.query(`
            INSERT INTO billing_subscription 
            (account_id, biller_id, reference_number, billing_day, amount, auto_pay)
            VALUES 
            (@accountId, @billerId, @referenceNumber, @billingDay, @amount, @autoPay)
        `);

        res.status(201).json({ message: "Billing subscription added successfully." });
    } catch (error) {
        console.error("Add subscription error:", error);
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ message: "This exact subscription already exists for this account." });
        }
        res.status(500).json({ message: "Failed to create subscription." });
    }
};

const getPendingBills = async (req, res) => {
    try {
        const userId = req.user.userId;
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);

        const result = await request.query(`
            SELECT b.bill_id, b.amount, b.due_date, b.status, 
                   bs.reference_number, br.name AS biller_name, a.account_id
            FROM bill b
            JOIN billing_subscription bs ON b.subscription_id = bs.subscription_id
            JOIN biller br ON bs.biller_id = br.biller_id
            JOIN account a ON bs.account_id = a.account_id
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE c.user_id = @userId AND b.status = 'pending'
            ORDER BY b.due_date ASC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Get pending bills error:", error);
        res.status(500).json({ message: "Failed to fetch pending bills." });
    }
};

const payBill = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        const { billId } = req.params;
        const userId = req.user.userId;

        await transaction.begin();
        const request = new sql.Request(transaction);
        
        request.input('billId', sql.Int, billId);
        request.input('userId', sql.Int, userId);

        const billResult = await request.query(`
            SELECT b.amount, b.status, a.account_id, a.balance 
            FROM bill b
            JOIN billing_subscription bs ON b.subscription_id = bs.subscription_id
            JOIN account a ON bs.account_id = a.account_id
            JOIN customer c ON a.customer_id = c.customer_id
            WHERE b.bill_id = @billId AND c.user_id = @userId
        `);

        if (billResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Bill not found or you do not have permission to pay it." });
        }

        const { amount, status, account_id, balance } = billResult.recordset[0];

        if (status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ message: "This bill has already been paid or failed." });
        }

        if (balance < amount) {
            await transaction.rollback();
            return res.status(400).json({ message: "Insufficient funds in the linked account to pay this bill." });
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
            VALUES (@accountId, NULL, @amount, 'bill', 'success')
        `);
        
        const newTransactionId = txResult.recordset[0].transaction_id;
        request.input('transactionId', sql.Int, newTransactionId);

        await request.query(`
            UPDATE bill 
            SET status = 'paid' 
            WHERE bill_id = @billId
        `);
        await request.query(`
            INSERT INTO bill_payment (bill_id, transaction_id, result)
            VALUES (@billId, @transactionId, 'success')
        `);

        await transaction.commit();
        res.status(200).json({ message: "Bill successfully paid." });

    } catch (error) {
        if (transaction.isActive) {
            await transaction.rollback();
        }
        console.error("Pay bill error:", error);
        res.status(500).json({ message: "Server error during bill payment." });
    }
};

module.exports = { browseBillers, addSubscription, getPendingBills, payBill };