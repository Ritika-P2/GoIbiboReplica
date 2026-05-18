const logger = require('../config/logger')
const { errorResponse } = require('../utils/apiResponse')

function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method })

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json(errorResponse('A record with this value already exists.'))
    }
    if (err.code === 'P2025') {
      return res.status(404).json(errorResponse('Record not found.'))
    }
    if (err.code === 'P2003') {
      return res.status(401).json(errorResponse('Session expired. Please log out and log in again.'))
    }
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Invalid or expired token.'))
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json(errorResponse(err.message))
  }

  const status = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : 'Internal server error.'
  res.status(status).json(errorResponse(message))
}

module.exports = { errorHandler }
