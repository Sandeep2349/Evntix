const jwt = require('jsonwebtoken');
const User = require("../models/User"); // 1. Fixed casing to match capital User

// User Authentication Middleware
const protect = async (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 2. Used decoded.id instead of jwt.decoded.id
            // 3. Used '-password' to EXCLUDE the password and keep role, email, etc.

            req.user = await User.findById(decoded.id).select('-password');
            console.log(req.user)
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Admin Authorization Middleware
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Forbidden, admin access required" });
    }
};

module.exports = { protect, admin };