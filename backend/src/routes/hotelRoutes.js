const router = require('express').Router()
const { searchHotels, getHotelById, getHotelRooms, listHotels, createHotel, updateHotel, deleteHotel, approveHotel, rejectHotel } = require('../controllers/hotelController')
const { authMiddleware, adminMiddleware, moduleMiddleware, approverMiddleware } = require('../middleware/authMiddleware')

const hotelModule = moduleMiddleware('HOTELS')

router.get('/search',    searchHotels)
router.get('/',          authMiddleware, adminMiddleware, hotelModule, listHotels)
router.post('/',         authMiddleware, adminMiddleware, hotelModule, createHotel)
router.put('/:id',       authMiddleware, adminMiddleware, hotelModule, updateHotel)
router.delete('/:id',    authMiddleware, adminMiddleware, hotelModule, deleteHotel)
router.get('/:id',          getHotelById)
router.get('/:id/rooms',    getHotelRooms)
router.post('/:id/approve', authMiddleware, approverMiddleware, approveHotel)
router.post('/:id/reject',  authMiddleware, approverMiddleware, rejectHotel)

module.exports = router
