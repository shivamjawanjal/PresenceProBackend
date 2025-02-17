const jwt = require('jsonwebtoken');
const JWT_SECRET = 'shivam@jawanajl';

const fetchuser = (req, res, next) => {
    // Get the token from the request header
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user; // Attach user data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error.message);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = fetchuser;
