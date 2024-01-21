const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || "local";
require("dotenv").config({ path: `.env.${env}` });

const middleware = async (req, res, next) => {

    const secretKey = process.env.JWT_SECRET_KEY;
    const authorization = req.header('Authorization').split(' ');
    const token = authorization[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
}

module.exports = {
    middleware
}