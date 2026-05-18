const router = require('express').Router()
const { createReview, getHotelReviews } = require('../controllers/reviewController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/hotel/:hotelId',  getHotelReviews)
router.post('/', authMiddleware, createReview)

module.exports = router
