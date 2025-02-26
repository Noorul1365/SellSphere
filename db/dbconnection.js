const mongoose = require('mongoose');
require('dotenv').config()

const dbConnection = mongoose.connect(process.env.MONGO_URL,)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err))

module.exports = dbConnection;