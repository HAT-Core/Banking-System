require('dotenv').config();
const express = require('express');
const { connectDB } = require('./config/db');
const { runScheduledTransfers } = require('./jobs/scheduledTransferJob');
const transactionRoutes = require('./routes/transactionRoutes');
const transferRoutes = require('./routes/transferRoutes');
const branchRoutes = require('./routes/branchRoutes');
const accountRoutes = require('./routes/accountRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kycRoutes = require('./routes/kycRoutes');
const loanRoutes = require('./routes/loanRoutes');
const billRoutes = require('./routes/billRoutes');
const statementRoutes = require('./routes/statementRoutes');

const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/statements', statementRoutes);

connectDB();
runScheduledTransfers();

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});