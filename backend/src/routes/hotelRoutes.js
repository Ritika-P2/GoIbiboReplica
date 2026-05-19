const router = require('express').Router()
const { searchHotels, getHotelById, getHotelRooms, listHotels, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

router.get('/search',    searchHotels)
router.get('/',          authMiddleware, adminMiddleware, listHotels)
router.post('/',         authMiddleware, adminMiddleware, createHotel)
router.put('/:id',       authMiddleware, adminMiddleware, updateHotel)
router.delete('/:id',    authMiddleware, adminMiddleware, deleteHotel)
router.get('/:id',       getHotelById)
router.get('/:id/rooms', getHotelRooms)

module.exports = router
