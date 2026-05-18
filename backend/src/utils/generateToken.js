const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')

function generateToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.refreshExpiresIn })
}

module.exports = { generateToken, generateRefreshToken }
