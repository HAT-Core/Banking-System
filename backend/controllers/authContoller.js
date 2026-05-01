const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        const { 
            username, password, role, 
            firstName, lastName, cnic, phone, address, dateOfBirth, 
            jobTitle, employeeCode 
        } = req.body;
        if (role === 'admin') {
            return res.status(403).json({ 
                message: "SECURITY ALERT: Admin accounts must be created manually by the IT Department." 
            });
        }
        if (role === 'employee') {
            if (!jobTitle) {
                return res.status(400).json({ message: "Employees must provide a job title." });
            }
            if (employeeCode !== process.env.EMPLOYEE_SECRET_CODE) {
                return res.status(403).json({ 
                    message: "Invalid Employee Authorization Code. Registration denied." 
                });
            }
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await transaction.begin();
        const request = new sql.Request(transaction);

        request.input('username', sql.VarChar, username);
        request.input('passwordHash', sql.VarChar, hashedPassword);
        request.input('role', sql.VarChar, role);
        request.input('firstName', sql.VarChar, firstName);
        request.input('lastName', sql.VarChar, lastName);
        request.input('cnic', sql.VarChar, cnic);
        request.input('phone', sql.VarChar, phone);
        request.input('address', sql.VarChar, address);
        request.input('dateOfBirth', sql.Date, dateOfBirth);

        const userResult = await request.query(`
            INSERT INTO user_account 
            (username, password_hash, role, first_name, last_name, cnic, phone, address, date_of_birth)
            OUTPUT INSERTED.user_id
            VALUES 
            (@username, @passwordHash, @role, @firstName, @lastName, @cnic, @phone, @address, @dateOfBirth)
        `);

        const newUserId = userResult.recordset[0].user_id;
        request.input('newUserId', sql.Int, newUserId);

        if (role === 'customer') {
            await request.query(`INSERT INTO customer (user_id) VALUES (@newUserId)`);
        } 
        else if (role === 'employee') {
            request.input('jobTitle', sql.VarChar, jobTitle);
            await request.query(`INSERT INTO employee (user_id, job_title) VALUES (@newUserId, @jobTitle)`);
        } 

        await transaction.commit();

        res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!` });

    } catch (error) {
        if (transaction.isActive) {
            await transaction.rollback();
        }
        
        console.error("Registration error:", error);
        
        //Handle Duplicate constraints (Username, CNIC, Phone)
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ message: "Username, CNIC, or Phone already exists." });
        }

        res.status(500).json({ message: "Server error during registration." });
    }
};

module.exports = { registerUser };