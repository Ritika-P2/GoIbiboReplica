const router = require('express').Router()
const { searchHotels, getHotelById, getHotelRooms, listHotels, createHotel, updateHotel, deleteHotel, approveHotel, rejectHotel } = require('../controllers/hotelController')
const { authMiddleware, adminMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

router.get('/search',    searchHotels)
router.get('/',          authMiddleware, adminMiddleware, listHotels)
router.post('/',         authMiddleware, adminMiddleware, createHotel)
router.put('/:id',       authMiddleware, adminMiddleware, updateHotel)
router.delete('/:id',    authMiddleware, adminMiddleware, deleteHotel)
router.get('/:id',          getHotelById)
router.get('/:id/rooms',    getHotelRooms)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveHotel)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectHotel)

module.exports = router
