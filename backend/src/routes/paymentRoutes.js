const router = require('express').Router()
const { initiatePayment, verifyPayment } = require('../controllers/paymentController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.use(authMiddleware)
router.post('/initiate', initiatePayment)
router.post('/verify',   verifyPayment)

module.exports = router
