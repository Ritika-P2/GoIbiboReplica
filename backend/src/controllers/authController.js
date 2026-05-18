const authService = require('../services/authService')
const { successResponse } = require('../utils/apiResponse')

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body)
    res.status(201).json(successResponse('Account created successfully.', { user, token }))
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body)
    res.status(200).json(successResponse('Login successful.', { user, token }))
  } catch (err) {
    next(err)
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id)
    res.status(200).json(successResponse('User fetched.', { user }))
  } catch (err) {
    next(err)
  }
}

async function logout(_req, res) {
  res.status(200).json(successResponse('Logged out successfully.'))
}

module.exports = { register, login, getMe, logout }
