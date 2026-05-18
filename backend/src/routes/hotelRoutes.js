const router = require('express').Router()
const { searchHotels, getHotelById, getHotelRooms } = require('../controllers/hotelController')

router.get('/search', searchHotels)
router.get('/:id',       getHotelById)
router.get('/:id/rooms', getHotelRooms)

module.exports = router
