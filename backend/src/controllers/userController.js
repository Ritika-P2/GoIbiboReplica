const userService = require('../services/userService')
const { successResponse } = require('../utils/apiResponse')

async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id)
    res.status(200).json(successResponse('Profile fetched.', { user }))
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.id, req.body)
    res.status(200).json(successResponse('Profile updated.', { user }))
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile }
