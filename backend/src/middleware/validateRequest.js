const { validationResult } = require('express-validator')
const { errorResponse } = require('../utils/apiResponse')

function validateRequest(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg).join(', ')
    return res.status(422).json(errorResponse(messages, errors.array()))
  }
  next()
}

module.exports = { validateRequest }
