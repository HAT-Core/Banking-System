require('dotenv').config();
const express = require('express');
const {connectDB} = require('./config/db');
const { runScheduledTransfers } = require('./jobs/scheduledTransferJob');
const transactionRoutes = require('./routes/transactionRoutes');
const transferRoutes = require('./routes/transferRoutes');
const branchRoutes = require('./routes/branchRoutes');

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/admin',require('./routes/adminRoutes'));
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/branch', branchRoutes);

connectDB();
runScheduledTransfers();

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});


