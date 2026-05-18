const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')
const { errorResponse } = require('../utils/apiResponse')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('Access denied. No token provided.'))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, jwtConfig.secret)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json(errorResponse('Invalid or expired token.'))
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Access denied. Admins only.'))
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware }
