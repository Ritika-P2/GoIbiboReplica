const router = require('express').Router()
const { validateCoupon } = require('../controllers/couponController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.post('/validate', authMiddleware, validateCoupon)

module.exports = router
