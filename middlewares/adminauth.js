const jwt = require('jsonwebtoken');
require('dotenv').config();

const Admin = require('../models/AdminModel.js');

const proctected = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        jwt.verify(token, process.env.ADMINSECRET, (err, decoded) => {
            if (err) {
              return res.status(401).json({ message: 'Unauthorized' });
            }
            
            // Save decoded token to request for use in other routes
            req.admin = {
                id: decoded.adminId, // Ensure userId exists in the token
                email: decoded.email, // Add any other user details if necessary
            };
            next();
        });
    } catch (err) {
        return res.status(401).json({ message: "Authentication failed", error: err.message });
    }
};



module.exports = { proctected };
