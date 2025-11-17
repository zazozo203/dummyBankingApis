require('dotenv').config();
const express = require('express')
const cors = require('cors');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const morgan = require('morgan');

const Bank = express()
Bank.use(express.json());
Bank.use(cors());
Bank.use(morgan("dev"));
Bank.use('/api', authRoutes);
Bank.use('/api/auth', accountRoutes);



Bank.listen(process.env.PORT,()=>{
    console.log(`Bank is listening on port ${process.env.PORT}...`);
})

