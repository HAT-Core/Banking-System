const {sql} = require('../config/db');

const addBank = async(req, res)=>{
    try{
        const {bankName} = req.body;
        const request = new sql.Request();
        
        request.input('bankName', sql.VarChar, bankName);

        await request.query(`
            INSERT INTO supported_bank (bank_name) 
            VALUES (@bankName)
        `);

        res.status(201).json({message: "Partner bank added successfully."});
    } 
    catch(error){
        console.error("Add bank error:", error);
        res.status(500).json({message: "Failed to add bank to catalog."});
    }
};

const getBanks = async(req, res)=>{
    try{
        const result = await sql.query(`SELECT * FROM supported_bank ORDER BY bank_name ASC`);
        res.status(200).json(result.recordset);
    }
    catch(error){
        console.error("Get banks error:", error);
        res.status(500).json({message: "Failed to fetch bank catalog."});
    }
};
const getBillers = async(req, res)=>{
    try{
        const result = await sql.query(`SELECT * FROM biller ORDER BY name ASC`);
        res.status(200).json(result.recordset);
    }
    catch(error){
        console.error("Get billers error:", error);
        res.status(500).json({message: "Failed to fetch biller catalog."});
    }
};
const getLoans = async(req, res)=>{
    try{
        const result = await sql.query(`SELECT * FROM loan_type ORDER BY type_name ASC`);
        res.status(200).json(result.recordset);
    }
    catch(error){
        console.error("Get loans error:", error);
        res.status(500).json({message: "Failed to fetch loan catalog."});
    }
};

const addBiller = async(req, res)=>{
    try{
        const {name, category} = req.body; 
        
        if (category !== 'government' && category !== 'private'){
            return res.status(400).json({message: "Category must be 'government' or 'private'."});
        }

        const request = new sql.Request();
        request.input('name', sql.VarChar, name);
        request.input('category', sql.VarChar, category);

        await request.query(`
            INSERT INTO biller (name, category) 
            VALUES (@name, @category)
        `);

        res.status(201).json({message: "Utility biller added successfully."});
    } 
    catch (error){
        console.error("Add biller error:", error);
        res.status(500).json({message: "Failed to add biller to catalog."});
    }
};

const updateLoanRate = async(req, res)=>{
    try{
        const {id} = req.params; 
        const {interestRate} = req.body; 
        
        const request = new sql.Request();
        
        request.input('newRate', sql.Decimal(5, 2), interestRate);
        request.input('loanTypeId', sql.Int, id);

        await request.query(`
            UPDATE loan_type 
            SET interest_rate = @newRate 
            WHERE loan_type_id = @loanTypeId
        `);

        res.status(200).json({message: "Loan interest rate updated successfully."});
    } 
    catch (error){
        console.error("Update loan rate error:", error);
        res.status(500).json({message: "Failed to update loan rate."});
    }
};
const getEmployees = async(req, res)=>{
    try {
        const result = await sql.query(`
            SELECT u.user_id, u.username, u.first_name, u.last_name, u.status, u.created_at,
                e.employee_id, e.job_title
            FROM user_account u
            JOIN employee e ON u.user_id = e.user_id
            WHERE u.role = 'employee'
            ORDER BY u.created_at DESC
        `);
        
        res.status(200).json(result.recordset);
    } 
    catch (error){
        console.error("Get employees error:", error);
        res.status(500).json({message: "Failed to fetch employee list." });
    }
};

const getCustomers = async(req, res)=>{
    try {
        const result = await sql.query(`
            SELECT u.user_id, u.username, u.first_name, u.last_name, u.status, u.created_at,
                c.customer_id, c.kyc_status
            FROM user_account u
            JOIN customer c ON u.user_id = c.user_id
            WHERE u.role = 'customer'
            ORDER BY u.created_at DESC
        `);
        
        res.status(200).json(result.recordset);
    } 
    catch (error){
        console.error("Get customers error:", error);
        res.status(500).json({message: "Failed to fetch customer list." });
    }
};

const updateUserStatus = async(req, res)=>{
    try{
        const {id} = req.params;
        const {status} = req.body; 

        if (status !== 'active' && status !== 'locked'){
            return res.status(400).json({message: "Status must be 'active' or 'locked'." });
        }

        const request = new sql.Request();
        request.input('status', sql.VarChar, status);
        request.input('userId', sql.Int, id);

        await request.query(`
            UPDATE user_account 
            SET status = @status 
            WHERE user_id = @userId AND role != 'admin'
        `);

        res.status(200).json({message: `User account has been ${status}.` });
    } 
    catch (error){
        console.error("Update status error:", error);
        res.status(500).json({message: "Failed to update user status."});
    }
};


module.exports = {addBank, getBanks, addBiller, getBillers, updateLoanRate, getLoans, getEmployees, getCustomers, updateUserStatus};
