const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (token && token !== 'undefined' && token !== 'null') {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
                req.user = decoded
                return next()
            } catch {
                // Token expired or invalid - fallback to guest user so request isn't blocked
                req.user = { id: 'guest' }
                return next()
            }
        }

        req.user = { id: 'guest' }
        next()
    } catch {
        req.user = { id: 'guest' }
        next()
    }
}

module.exports = authMiddleware