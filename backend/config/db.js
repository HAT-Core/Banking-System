const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: "127.0.0.1",
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true,
        encrypt: false,
        instanceName: "MSSQLSERVER02"
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("MSSQL Database connected successfully!");
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
};

module.exports = { sql, connectDB };