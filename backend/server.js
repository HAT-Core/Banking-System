require('dotenv').config();
const express = require('express');
const {connectDB} = require('./config/db');

const app = express();

app.use(express.json());
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/admin',require('./routes/adminRoutes'));
connectDB();

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});