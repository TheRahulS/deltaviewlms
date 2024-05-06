const jwt = require('jsonwebtoken');
const db = require('../config/db_Setting');

const requireSignIn = async (req, res, next) => {
    const token = req.header('Authorization');


    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }
    const extractedToken = token.split(' ')[1];


    try {
        // /verift and validate our token
        const decoded = jwt.verify(extractedToken, 'dfghjnhbgdsdsdvf')
        req.userId = decoded.userId;
        next();

    } catch (err) {
        res.status(401).json({ message: "Invalid Token" })
    }
}

const isAdmin = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await db.select('tbl_admin', '*', `id='${userId}'`);

        if (user && user.role === 'admin') {
            return next();
        } else {
            return res.status(403).json({ message: 'you are not admin' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { requireSignIn, isAdmin };
