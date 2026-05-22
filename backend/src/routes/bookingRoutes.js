const router = require('express').Router()
const { createBooking, confirmPayment, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController')
const { authMiddleware } = require('../middleware/authMiddleware')
const { bookingValidator } = require('../validators/bookingValidator')
const { validateRequest } = require('../middleware/validateRequest')

router.use(authMiddleware)
router.post('/',                      bookingValidator, validateRequest, createBooking)
router.post('/:id/confirm-payment',   confirmPayment)
router.get('/my',                     getMyBookings)
router.get('/:id',                    getBookingById)
router.patch('/:id/cancel',           cancelBooking)

module.exports = router
