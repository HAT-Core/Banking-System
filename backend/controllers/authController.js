const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const transaction = new sql.Transaction();

    try {
        const creatorRole = req.user.role; 

        const { 
            username, password, role, 
            firstName, lastName, cnic, phone, address, dateOfBirth, 
            jobTitle 
        } = req.body;

        if (role === 'admin') {
            return res.status(403).json({ 
                message: "SECURITY ALERT: Admin accounts must be created manually by the IT Department." 
            });
        }

        if (role === 'customer') {
            if (creatorRole !== 'admin' && creatorRole !== 'employee') {
                return res.status(403).json({ 
                    message: "Forbidden: Only authorized staff can register new customers." 
                });
            }
        }

        if (role === 'employee') {
            if (creatorRole !== 'admin') {
                return res.status(403).json({ 
                    message: "Forbidden: Only Administrators can provision new employee accounts." 
                });
            }
            if (!jobTitle) {
                return res.status(400).json({ message: "Employees must provide a job title." });
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

        res.status(201).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} provisioned successfully.` });

    } 
    catch (error) {
        if (transaction.isActive) {
            await transaction.rollback();
        }
        
        console.error("Registration error:", error);
        
        if (error.number === 2627 || error.number === 2601) {
            return res.status(409).json({ message: "Username, CNIC, or Phone already exists in the system." });
        }

        res.status(500).json({ message: "Server error during account provisioning." });
    }
};

const loginUser = async (req, res) => {
    try {
        const {username, password} = req.body;

        const request = new sql.Request();
        request.input('username', sql.VarChar, username);
        
        const result = await request.query(`
            SELECT first_name, last_name, user_id, username, password_hash, role, status 
            FROM user_account 
            WHERE username = @username
        `);

        if (result.recordset.length === 0){
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const user = result.recordset[0];

        if (user.status === 'locked'){
            return res.status(403).json({ message: "Your account is locked. Please contact support." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

module.exports = {registerUser, loginUser};