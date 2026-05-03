const { sql } = require('../config/db');

const getPendingKYCQueue = async (req, res) => {
    try {
        // 1. Immediately block unauthorized roles per the System Architecture Guide
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Staff access only." });
        }

        // Fetch customers whose KYC is pending, joining user_account for context
        const result = await sql.query(`
            SELECT c.customer_id, u.first_name, u.last_name, u.cnic, u.phone, u.address, c.kyc_status, u.created_at
            FROM customer c
            JOIN user_account u ON c.user_id = u.user_id
            WHERE c.kyc_status = 'pending'
            ORDER BY u.created_at ASC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Get pending KYC error:", error);
        res.status(500).json({ message: "Failed to fetch pending KYC queue." });
    }
};

const updateKYCStatus = async (req, res) => {
    try {
        // 1. Immediately block unauthorized roles
        if (req.user.role !== 'employee' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Staff access only." });
        }

        const { id } = req.params; // customer_id
        const { status } = req.body; 

        // Map 'active' from the frontend request to the strict 'verified' schema requirement
        const newStatus = status === 'active' ? 'verified' : status;

        if (newStatus !== 'verified' && newStatus !== 'rejected') {
            return res.status(400).json({ message: "Status must be 'verified' (or active) or 'rejected'." });
        }

        const request = new sql.Request();
        
        // 2. Map the JWT user_id to the database employee_id
        request.input('userId', sql.Int, req.user.userId);
        const empResult = await request.query(`SELECT employee_id FROM employee WHERE user_id = @userId`);
        
        let employeeId = null;
        if (empResult.recordset.length > 0) {
            employeeId = empResult.recordset[0].employee_id;
        } else {
            // Failsafe: The schema CHECK constraint demands verified_by_employee IS NOT NULL.
            // If an admin without an employee record tries to approve, the DB will reject it.
            return res.status(403).json({ 
                message: "Action failed: Your account does not have an associated employee profile to satisfy the audit trail." 
            });
        }

        // 3. Execute the update
        request.input('status', sql.VarChar, newStatus);
        request.input('employeeId', sql.Int, employeeId);
        request.input('customerId', sql.Int, id);

        const result = await request.query(`
            UPDATE customer
            SET kyc_status = @status,
                verified_by_employee = @employeeId,
                verified_date = GETDATE()
            WHERE customer_id = @customerId AND kyc_status = 'pending'
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Customer not found or KYC is already processed." });
        }

        res.status(200).json({ message: `Customer KYC status successfully updated to ${newStatus}.` });

    } catch (error) {
        console.error("Update KYC status error:", error);
        res.status(500).json({ message: "Failed to update KYC status." });
    }
};

module.exports = { getPendingKYCQueue, updateKYCStatus };