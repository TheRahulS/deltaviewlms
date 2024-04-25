const jwt = require('jsonwebtoken');

const combinedMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return next();
    }

    // Extract the token from the Authorization header
    const extractedToken = token.split(' ')[1];

    try {
        // Verify and validate the token
        let decodedToken;
        let source;

        try {
            // Verify and decode the token for signup
            decodedToken = jwt.verify(extractedToken, 'kjhgfghj');
            source = 'signup';
        } catch (signupErr) {
            // If it's not a signup token, try to verify it as a login token
            decodedToken = jwt.verify(extractedToken, 'dfghjnhbgvf');
            source = 'login';
        }

        // Set the userId in the request object based on the token type
        req.userId = decodedToken.userId;
        req.tokenSource = source;

        next();
    } catch (err) {
        // If the token is invalid or has expired, return a 401 Unauthorized status
        console.error('Invalid token:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = combinedMiddleware;

