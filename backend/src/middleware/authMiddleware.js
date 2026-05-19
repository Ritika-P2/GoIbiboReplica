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

// MANAGER or ADMIN — can manage inventory (add/edit/delete)
function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'MANAGER' && req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Access denied. Managers only.'))
  }
  next()
}

// ADMIN only — can approve or reject entries
function approverMiddleware(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json(errorResponse('Access denied. Approvers only.'))
  }
  next()
}

module.exports = { authMiddleware, adminMiddleware, approverMiddleware }
