const router = require('express').Router()
const { register, login, getMe, logout } = require('../controllers/authController')
const { authMiddleware } = require('../middleware/authMiddleware')
const { authRateLimiter } = require('../middleware/rateLimiter')
const { validateRequest } = require('../middleware/validateRequest')
const { registerValidator, loginValidator } = require('../validators/authValidator')

router.post('/register', authRateLimiter, registerValidator, validateRequest, register)
router.post('/login',    authRateLimiter, loginValidator,    validateRequest, login)
router.get('/me',        authMiddleware,  getMe)
router.post('/logout',   authMiddleware,  logout)

module.exports = router
