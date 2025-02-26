const jwt = require('jsonwebtoken');
require('dotenv').config();

//const User = require('../models/userModel.js');

const isAuthentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header

        //const token = req.cookies.token;
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
    
            // Attach decoded info to request
            req.user = {
                id: decoded.userId,
                email: decoded.email,
            };
            next();
        });
    } catch (err) {
        return res.status(401).json({ message: "Authentication failed", error: err.message });
    }
};

module.exports = { isAuthentication };
