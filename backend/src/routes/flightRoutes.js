const router = require('express').Router()
const { searchFlights, getFlightById, listFlights, createFlight, updateFlight, deleteFlight } = require('../controllers/flightController')
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')
const { searchValidator } = require('../validators/searchValidator')
const { validateRequest } = require('../middleware/validateRequest')

router.get('/search', searchValidator, validateRequest, searchFlights)
router.get('/',       authMiddleware, adminMiddleware, listFlights)
router.post('/',      authMiddleware, adminMiddleware, createFlight)
router.put('/:id',    authMiddleware, adminMiddleware, updateFlight)
router.delete('/:id', authMiddleware, adminMiddleware, deleteFlight)
router.get('/:id',    getFlightById)

module.exports = router
