const jwt = require('jsonwebtoken');

function createauthMiddleware(roles = ['user']) {
    return function authMiddleware(req, res, next) {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing' });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!roles.includes(decode.role)) {
                return res.status(401).json({
                    message: 'You do not have permission to perform this action',
                });
            }
            req.user = decode;
            next();
        }
        catch (err) {
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
    }
}

module.exports = createauthMiddleware;